# Claude integration in Steerpast IAM

## Purpose

Claude is used at the decision-synthesis boundary, after deterministic identity, risk, and policy signals have been collected.

The design is intentionally hybrid:

Identity context → Risk evaluation → Policy evaluation → Claude-assisted DecisionAgent → Remediation → Audit

This keeps hard security constraints outside the model while using a model where contextual synthesis and explanation add value.

## Runtime behavior

The backend checks for ANTHROPIC_API_KEY.

When the key is available:

1. DecisionAgent creates an Anthropic client.
2. It calls the Claude Messages API.
3. The prompt asks for one supported outcome, a concise rationale, and confidence.
4. The response is parsed.
5. Outcome, rationale, and confidence are validated.
6. A successful result is returned with decisionProvider = claude.

When the key is absent, or Claude returns an error/malformed result, the system falls back to deterministic heuristics.

## Decision contract

Allowed outcomes:

- APPROVE
- FLAG_FOR_REVIEW
- RECOMMEND_REVOCATION
- AUTO_REMEDIATE

A model response is not accepted unless:

- outcome is one of the values above
- rationale is a non-empty string
- confidence is a finite number

Confidence is clamped to the 0–1 range before returning the decision.

## Deployment

Set these backend environment variables:

ANTHROPIC_API_KEY=<server-side secret>
ANTHROPIC_MODEL=claude-sonnet-4-5

The API credential is never embedded in frontend JavaScript.

## Why this architecture

Identity and policy systems need deterministic constraints, while security investigations also require contextual judgment and explanations. Steerpast therefore treats Claude as a bounded reasoning component inside a larger control plane rather than as the source of truth for authorization policy.

For the public demo, the dataset is synthetic and no production identity provider is connected.
