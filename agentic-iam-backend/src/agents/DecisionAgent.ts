import { RiskEvaluationResult } from './RiskAgent';
import { PolicyEvaluationResult } from './PolicyAgent';
import { Identity } from '../models/Identity';
import { huggingfaceConfig } from '../huggingfaceConfig';
import fetch from 'node-fetch';

export type DecisionOutcome =
  | 'APPROVE'
  | 'FLAG_FOR_REVIEW'
  | 'RECOMMEND_REVOCATION'
  | 'AUTO_REMEDIATE';

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
}

export class DecisionAgent {

  async decide(context: DecisionContext): Promise<DecisionResult> {
    // Use Hugging Face if apiKey and endpoint are set, else fallback
    const useHF = huggingfaceConfig.apiKey && huggingfaceConfig.endpoint && huggingfaceConfig.model;
    if (useHF) {
      return this.decideWithLLM(context);
    }
    return this.decideHeuristically(context);
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
      const data = await response.json();
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
      return {
        identityId: identity.id,
        outcome: parsed.outcome,
        rationale: parsed.rationale,
        confidence: parsed.confidence,
        usedLLM: true,
      };
    } catch (err) {
      // Fallback to heuristic if LLM call fails.
      return this.decideHeuristically(context);
    }
  }

  private decideHeuristically(context: DecisionContext): DecisionResult {
    const { identity, risk, policy } = context;
    const criticalViolations = policy.violations.filter((v) => v.severity === 'CRITICAL');
    const anyViolations = policy.violations.length > 0;

    let outcome: DecisionOutcome = 'APPROVE';
    let rationale: string;
    let confidence = 0.8;

    if (risk.riskScore >= 85 || criticalViolations.length > 0) {
      outcome = 'AUTO_REMEDIATE';
      confidence = 0.95;
      rationale =
        'Identity shows extremely high risk and at least one critical policy violation, ' +
        'so automatic remediation is the safest action.';
    } else if (risk.riskScore >= 70 || anyViolations) {
      outcome = 'RECOMMEND_REVOCATION';
      confidence = 0.9;
      rationale =
        'Elevated risk and/or policy violations indicate that current access should likely be revoked.';
    } else if (risk.riskScore >= 40) {
      outcome = 'FLAG_FOR_REVIEW';
      confidence = 0.75;
      rationale =
        'Moderate risk without severe violations suggests a human access review is appropriate.';
    } else {
      outcome = 'APPROVE';
      confidence = 0.9;
      rationale = 'Low risk and no significant policy violations; access is acceptable.';
    }

    return {
      identityId: identity.id,
      outcome,
      rationale,
      confidence,
      usedLLM: false,
    };
  }
}

