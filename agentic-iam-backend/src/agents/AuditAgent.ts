import { DecisionResult } from './DecisionAgent';
import { RiskEvaluationResult } from './RiskAgent';
import { PolicyEvaluationResult } from './PolicyAgent';
import { Identity } from '../models/Identity';
import { huggingfaceConfig } from '../huggingfaceConfig';
import fetch from 'node-fetch';

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

    // Use Hugging Face if apiKey and endpoint are set, else fallback
    const useHF = huggingfaceConfig.apiKey && huggingfaceConfig.endpoint && huggingfaceConfig.model;
    const explanation = useHF
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
    return record;
  }

  private async generateExplanationWithLLM(
    identity: Identity,
    decision: DecisionResult,
    risk: RiskEvaluationResult,
    policy: PolicyEvaluationResult
  ): Promise<string> {
    // Hugging Face text-generation API expects a prompt string
    const systemPrompt =
      'You are an IAM audit and explainability engine. Given identity details, risk scores, ' +
      'policy violations, and a final decision, generate a clear, concise explanation suitable ' +
      'for auditors and security architects. It must explicitly explain why risky combinations ' +
      'like interns holding production database admin roles are dangerous (e.g., blast radius, ' +
      'data exfiltration, SoD, regulatory exposure). Use 1-3 short paragraphs.';

    const userContent = {
      identity,
      risk,
      policyViolations: policy.violations,
      decision,
    };

    const prompt = `${systemPrompt}\n\n${JSON.stringify(userContent, null, 2)}`;

    try {
      // Optional: timeout handling for responsiveness
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${huggingfaceConfig.endpoint}${huggingfaceConfig.model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${huggingfaceConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 300,
              return_full_text: false,
            },
            options: { wait_for_model: true },
          }),
          signal: controller.signal,
        }
      );
      if (!response.ok) throw new Error('Hugging Face API error');
      const data = await response.json();
      // HF text-generation returns [{ generated_text: ... }] or { generated_text: ... }
      let text = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        text = data[0].generated_text;
      } else if (data.generated_text) {
        text = data.generated_text;
      } else if (data[0]?.generated_text) {
        text = data[0].generated_text;
      } else {
        text = JSON.stringify(data);
      }
      return text.trim();
    } catch {
      return this.generateExplanationLocally(identity, decision, risk, policy);
    }
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

