import { DecisionResult } from './DecisionAgent';
import { RiskEvaluationResult } from './RiskAgent';
import { PolicyEvaluationResult } from './PolicyAgent';
import { Identity } from '../models/Identity';
import { huggingfaceConfig } from '../huggingfaceConfig';

export interface AuditRecord {
  id: string;
  identityId: string;
  timestamp: number;
  decision: DecisionResult;
  risk: RiskEvaluationResult;
  policy: PolicyEvaluationResult;
  explanation: string;
}

export class AuditExplainabilityAgent {
  private records: AuditRecord[] = [];

  getRecords(): AuditRecord[] {
    return [...this.records];
  }

  async createRecord(
    identity: Identity,
    decision: DecisionResult,
    risk: RiskEvaluationResult,
    policy: PolicyEvaluationResult
  ): Promise<AuditRecord> {
    const hasLLM =
      Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ||
      Boolean(process.env.ANTHROPIC_API_KEY) ||
      Boolean(process.env.OPENAI_API_KEY) ||
      Boolean(huggingfaceConfig.apiKey && huggingfaceConfig.endpoint && huggingfaceConfig.model);

    const explanation = hasLLM
      ? await this.generateExplanationWithLLM(identity, decision, risk, policy)
      : this.generateExplanationLocally(identity, decision, risk, policy);

    const record: AuditRecord = {
      id: `audit-${Date.now()}-${identity.id}`,
      identityId: identity.id,
      timestamp: Date.now(),
      decision,
      risk,
      policy,
      explanation,
    };
    this.records.push(record);
    // Bounded in-memory log: a long-running instance must not grow without limit.
    if (this.records.length > 1000) this.records.splice(0, this.records.length - 1000);
    return record;
  }

  private async generateExplanationWithLLM(
    identity: Identity,
    decision: DecisionResult,
    risk: RiskEvaluationResult,
    policy: PolicyEvaluationResult
  ): Promise<string> {
    const systemPrompt =
      'You are an IAM audit and explainability engine inside Steerpast IAM. Given identity details, risk scores, ' +
      'policy violations, and a final decision, generate a clear, concise explanation suitable ' +
      'for auditors and security architects. Explain why risky combinations ' +
      'or autonomous AI agent privileges are dangerous (blast radius, data exfiltration, SoD, regulatory exposure). ' +
      'Use 1-2 concise paragraphs.';

    const userContent = {
      identity,
      risk,
      policyViolations: policy.violations,
      decision,
    };

    const promptText = `${systemPrompt}\n\n${JSON.stringify(userContent, null, 2)}`;

    try {
      // 1. Google Gemini
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (geminiKey) {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 350 },
            }),
            signal: AbortSignal.timeout(10000),
          }
        );
        if (res.ok) {
          const data: any = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text?.trim()) return text.trim();
        }
      }

      // 2. Anthropic Claude
      if (process.env.ANTHROPIC_API_KEY) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
            max_tokens: 350,
            system: systemPrompt,
            messages: [{ role: 'user', content: JSON.stringify(userContent) }],
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data: any = await res.json();
          const text = data.content?.find((b: any) => b.type === 'text')?.text;
          if (text?.trim()) return text.trim();
        }
      }

      // 3. OpenAI
      if (process.env.OPENAI_API_KEY) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(userContent) },
            ],
            max_tokens: 350,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data: any = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text?.trim()) return text.trim();
        }
      }

      // 4. Hugging Face fallback if configured
      if (huggingfaceConfig.apiKey && huggingfaceConfig.endpoint && huggingfaceConfig.model) {
        const res = await fetch(`${huggingfaceConfig.endpoint}${huggingfaceConfig.model}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${huggingfaceConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: promptText,
            parameters: { max_new_tokens: 250, return_full_text: false },
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data: any = await res.json();
          const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
          if (text?.trim()) return text.trim();
        }
      }
    } catch {
      // Fall through to deterministic local generator
    }

    return this.generateExplanationLocally(identity, decision, risk, policy);
  }

  private generateExplanationLocally(
    identity: Identity,
    decision: DecisionResult,
    risk: RiskEvaluationResult,
    policy: PolicyEvaluationResult
  ): string {
    const critical = policy.violations.filter((v) => v.severity === 'CRITICAL');
    const hasCritical = critical.length > 0;
    const policySummary =
      policy.violations.length === 0
        ? 'No explicit policy violations were detected for this identity.'
        : `Detected ${policy.violations.length} policy violation(s), including ${critical.length} critical.`;

    const internWithProdLikeAccess =
      identity.attributes.seniority === 'INTERN' &&
      identity.roles.some((r) => r.toLowerCase().includes('prod') || r.toLowerCase().includes('admin'));

    const internExplanation = internWithProdLikeAccess
      ? 'Granting production-adjacent or administrative roles to an intern materially increases the blast radius ' +
        'of simple mistakes and makes deliberate abuse or credential theft far more damaging. An intern typically ' +
        'lacks the operational context and oversight expected for direct production access, and their credentials ' +
        'are a softer target for attackers.'
      : '';

    return [
      `Identity ${identity.name} (${identity.attributes.title}, ${identity.attributes.department}) was evaluated with a composite risk score of ${risk.riskScore} (0–100). ${policySummary}`,
      `The decision engine selected outcome ${decision.outcome} with confidence ${(decision.confidence * 100).toFixed(
        1
      )}%, based on risk factors (${risk.contextSummary}) and the presence of high-sensitivity roles and domains.`,
      hasCritical
        ? 'Critical violations indicate that the current access profile conflicts with least privilege or segregation of duties expectations.'
        : '',
      internExplanation,
    ]
      .filter(Boolean)
      .join(' ');
  }
}

