import { RiskEvaluationResult } from './RiskAgent';
import { PolicyEvaluationResult } from './PolicyAgent';
import { Identity } from '../models/Identity';
import { huggingfaceConfig } from '../huggingfaceConfig';
import { RISK_TIERS, riskTier } from '../riskTiers';
import Anthropic from '@anthropic-ai/sdk';

export type DecisionOutcome =
  | 'APPROVE'
  | 'FLAG_FOR_REVIEW'
  | 'RECOMMEND_REVOCATION'
  | 'AUTO_REMEDIATE';

export const VALID_OUTCOMES: DecisionOutcome[] = [
  'APPROVE',
  'FLAG_FOR_REVIEW',
  'RECOMMEND_REVOCATION',
  'AUTO_REMEDIATE',
];

export interface DecisionContext {
  identity: Identity;
  risk: RiskEvaluationResult;
  policy: PolicyEvaluationResult;
}

export interface DecisionResult {
  identityId: string;
  outcome: DecisionOutcome;
  rationale: string;
  confidence: number; // 0-1
  usedLLM: boolean;
  decisionProvider: 'claude' | 'huggingface' | 'heuristic';
  /** Model that produced the decision, when a model was used. */
  model?: string;
  /** Wall-clock time spent producing the decision. */
  latencyMs?: number;
  /** True when this result was served from the decision cache. */
  cached?: boolean;
  /** Set when a model call failed and the deterministic engine answered instead. */
  fallbackReason?: string;
}

const CLAUDE_TIMEOUT_MS = Number(process.env.ANTHROPIC_TIMEOUT_MS || 12000);
const CACHE_TTL_MS = Number(process.env.DECISION_CACHE_TTL_MS || 10 * 60 * 1000);
const CACHE_MAX = 500;

const SYSTEM_PROMPT = [
  'You are the DecisionAgent inside Steerpast IAM, an identity security control plane for human, service and AI-agent identities.',
  'You receive deterministic signals that upstream agents already computed: identity attributes and roles, a 0-100 composite risk score with its factors, and policy violations.',
  'Treat those signals as ground truth. Do not invent facts that are not in the input.',
  'Choose exactly one outcome:',
  '- APPROVE: access is appropriate for this identity.',
  '- FLAG_FOR_REVIEW: access may be legitimate but needs a human reviewer (elevated risk, AI agents holding critical access, unusual but not prohibited combinations).',
  '- RECOMMEND_REVOCATION: access clearly should be removed, but a human should confirm (critical policy violations, ineligible privileged roles, separation-of-duties conflicts).',
  '- AUTO_REMEDIATE: reserve for extreme, unambiguous cases (risk 85+ AND a critical violation) where waiting for a human is more dangerous than acting.',
  'Write the rationale for a security operator in one or two plain sentences that name the specific role, policy or factor that drove the outcome.',
  'Confidence is a number between 0 and 1 reflecting how clearly the signals support the outcome.',
  'Respond with only a JSON object: {"outcome": string, "rationale": string, "confidence": number}.',
].join('\n');

type CacheEntry = { at: number; result: DecisionResult };

export class DecisionAgent {
  private cache = new Map<string, CacheEntry>();
  private client: Anthropic | null = null;

  async decide(context: DecisionContext): Promise<DecisionResult> {
    const started = Date.now();
    let result: DecisionResult;
    if (process.env.ANTHROPIC_API_KEY) {
      result = await this.decideWithClaude(context);
    } else if (huggingfaceConfig.apiKey && huggingfaceConfig.endpoint && huggingfaceConfig.model) {
      result = await this.decideWithLLM(context);
    } else {
      result = this.decideHeuristically(context);
    }
    if (result.latencyMs === undefined) result.latencyMs = Date.now() - started;
    return result;
  }

  /** Stable key for the facts a decision depends on. Same facts, same decision. */
  private fingerprint({ identity, risk, policy }: DecisionContext): string {
    return JSON.stringify({
      id: identity.id,
      a: identity.attributes,
      r: [...identity.roles].sort(),
      s: risk.riskScore,
      v: policy.violations.map((v) => `${v.policyType}:${v.severity}:${v.id}`).sort(),
    });
  }

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        timeout: CLAUDE_TIMEOUT_MS,
        maxRetries: 1,
      });
    }
    return this.client;
  }

  private async decideWithClaude(context: DecisionContext): Promise<DecisionResult> {
    const { identity, risk, policy } = context;
    const key = this.fingerprint(context);
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return { ...hit.result, cached: true, latencyMs: 0 };
    }

    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    const started = Date.now();
    try {
      const response = await this.getClient().messages.create({
        model,
        max_tokens: 400,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              identity: {
                id: identity.id,
                name: identity.name,
                attributes: identity.attributes,
                roles: identity.roles,
                entitlements: identity.entitlements,
              },
              risk: { score: risk.riskScore, tier: riskTier(risk.riskScore), factors: risk.factors },
              policyViolations: policy.violations.map((v) => ({
                type: v.policyType,
                severity: v.severity,
                description: v.description,
              })),
            }),
          },
        ],
      });
      const text = response.content.find((block) => block.type === 'text')?.text || '';
      const parsed = this.parseDecisionResponse(text);
      const result: DecisionResult = {
        identityId: identity.id,
        outcome: parsed.outcome,
        rationale: parsed.rationale,
        confidence: parsed.confidence,
        usedLLM: true,
        decisionProvider: 'claude',
        model,
        latencyMs: Date.now() - started,
      };
      this.remember(key, result);
      return result;
    } catch (err) {
      const fallback = this.decideHeuristically(context);
      fallback.fallbackReason = err instanceof Error ? err.message.slice(0, 160) : 'Model call failed';
      return fallback;
    }
  }

  private remember(key: string, result: DecisionResult) {
    if (this.cache.size >= CACHE_MAX) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, { at: Date.now(), result });
  }

  /** Extract the first JSON object from model text and validate it strictly. */
  parseDecisionResponse(text: string): { outcome: DecisionOutcome; rationale: string; confidence: number } {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || text);
    return this.validateDecision(parsed);
  }

  private validateDecision(parsed: any): { outcome: DecisionOutcome; rationale: string; confidence: number } {
    const outcome = String(parsed?.outcome ?? '').toUpperCase() as DecisionOutcome;
    if (!VALID_OUTCOMES.includes(outcome)) {
      throw new Error('Model returned an unsupported decision outcome');
    }
    if (typeof parsed.rationale !== 'string' || !parsed.rationale.trim()) {
      throw new Error('Model returned an empty rationale');
    }
    const confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence)) {
      throw new Error('Model returned a non-numeric confidence');
    }
    return {
      outcome,
      rationale: parsed.rationale.trim().slice(0, 600),
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }

  private async decideWithLLM(context: DecisionContext): Promise<DecisionResult> {
    const { identity, risk, policy } = context;

    const systemPrompt =
      'You are an IAM decision engine. Given identity attributes, risk scores, and policy violations, ' +
      'you must choose a single outcome: APPROVE, FLAG_FOR_REVIEW, RECOMMEND_REVOCATION, or AUTO_REMEDIATE. ' +
      'Provide a concise rationale and a confidence score between 0 and 1. Respond strictly as JSON with ' +
      'fields: outcome, rationale, confidence.';

    const userContent = {
      identity: {
        id: identity.id,
        name: identity.name,
        attributes: identity.attributes,
        roles: identity.roles,
        entitlements: identity.entitlements,
      },
      risk,
      policyViolations: policy.violations,
    };

    const prompt = `${systemPrompt}\n\n${JSON.stringify(userContent, null, 2)}`;

    try {
      const response = await fetch(huggingfaceConfig.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingfaceConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 300, return_full_text: false },
          model: huggingfaceConfig.model,
        }),
      });
      if (!response.ok) throw new Error('Hugging Face API error');
      const data: any = await response.json();
      let message = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        message = data[0].generated_text;
      } else if (data.generated_text) {
        message = data.generated_text;
      } else if (data[0]?.generated_text) {
        message = data[0].generated_text;
      } else {
        message = JSON.stringify(data);
      }
      // Try to parse JSON from the model output
      let parsed: { outcome: DecisionOutcome; rationale: string; confidence: number } = {
        outcome: 'FLAG_FOR_REVIEW',
        rationale: 'Could not parse LLM output.',
        confidence: 0.5,
      };
      try {
        // Extract JSON from text if needed
        const jsonMatch = message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(message);
        }
      } catch {}
      const valid = this.validateDecision(parsed);
      return {
        identityId: identity.id,
        outcome: valid.outcome,
        rationale: valid.rationale,
        confidence: valid.confidence,
        usedLLM: true,
        decisionProvider: 'huggingface',
        model: huggingfaceConfig.model,
      };
    } catch (err) {
      // Fallback to heuristic if LLM call fails.
      return this.decideHeuristically(context);
    }
  }

  decideHeuristically(context: DecisionContext): DecisionResult {
    const { identity, risk, policy } = context;
    const critical = policy.violations.filter((v) => v.severity === 'CRITICAL');
    const isAgent = identity.attributes.identityType === 'AI_AGENT' || identity.attributes.identityType === 'SERVICE';
    const tier = riskTier(risk.riskScore).toLowerCase();
    const names: Record<string, string> = { ROLE_ELIGIBILITY: 'role-eligibility', SOD: 'separation-of-duties', LEAST_PRIVILEGE: 'least-privilege' };
    const describe = (v: (typeof policy.violations)[number]) => names[v.policyType] ?? v.policyType.toLowerCase();

    let outcome: DecisionOutcome;
    let confidence: number;
    let rationale: string;

    if (risk.riskScore >= 85 && critical.length > 0) {
      outcome = 'AUTO_REMEDIATE';
      confidence = 0.95;
      rationale = `Risk ${risk.riskScore}/100 with a critical ${describe(critical[0])} violation. Waiting for review is riskier than removing the access now.`;
    } else if (critical.length > 0 || risk.riskScore >= 70) {
      outcome = 'RECOMMEND_REVOCATION';
      confidence = critical.length > 0 ? 0.92 : 0.85;
      rationale = critical.length > 0
        ? `Critical ${describe(critical[0])} violation: ${critical[0].description} Revoke the offending access once an operator confirms.`
        : `Risk ${risk.riskScore}/100 is well above the ${RISK_TIERS.high} threshold. Revoke the excess access once an operator confirms.`;
    } else if (policy.violations.length > 0 || risk.riskScore >= RISK_TIERS.high) {
      outcome = 'FLAG_FOR_REVIEW';
      confidence = 0.78;
      rationale = policy.violations.length > 0
        ? `${policy.violations.length} non-critical policy finding(s), starting with ${describe(policy.violations[0])}. A reviewer should confirm the access is still needed.`
        : isAgent
          ? `Autonomous ${identity.attributes.identityType === 'AI_AGENT' ? 'agent' : 'service'} holding ${tier}-risk access (score ${risk.riskScore}). Its owner${identity.attributes.owner ? `, ${identity.attributes.owner},` : ''} should confirm the scope.`
          : `Risk ${risk.riskScore}/100 is in the ${tier} tier without a policy violation. A reviewer should confirm the access is still needed.`;
    } else {
      outcome = 'APPROVE';
      confidence = risk.riskScore < RISK_TIERS.medium ? 0.93 : 0.86;
      rationale = `Risk ${risk.riskScore}/100 (${tier}) and every policy check passed. Access matches the role and seniority.`;
    }

    return {
      identityId: identity.id,
      outcome,
      rationale,
      confidence,
      usedLLM: false,
      decisionProvider: 'heuristic',
    };
  }
}
