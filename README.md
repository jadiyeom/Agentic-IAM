# Steerpast IAM

Steerpast IAM is an identity security control plane for human, service, and AI-agent identities.

It connects identity context, contextual risk, policy evaluation, model-assisted decisioning, remediation, and audit evidence into one inspectable workflow.

## Live product

- Landing: https://steerpast.com/
- Claude integration: https://steerpast.com/claude
- Security model: https://steerpast.com/security
- Company: https://steerpast.com/company

The public demo uses seeded/sample identities and does not require a production identity-provider connection.

## Architecture

The backend is a TypeScript / Node.js / Express service organized around specialized agents:

- **IdentityAgent** — identity and entitlement context
- **RiskAgent** — contextual 0–100 risk evaluation
- **PolicyAgent** — least privilege, role eligibility, and policy constraints
- **DecisionAgent** — decision synthesis with optional Claude integration
- **RemediationAgent** — controlled corrective actions
- **AuditAgent** — evidence and decision history
- **IAMOrchestrator** — coordinates the end-to-end workflow

The frontend is React + TypeScript with a security workspace for identities, entitlements, explainability/audit, and system metrics.

## Claude integration

When `ANTHROPIC_API_KEY` is configured on the backend, `DecisionAgent` calls the Claude Messages API using the model alias configured by `ANTHROPIC_MODEL` (default: `claude-sonnet-4-5`).

The model receives structured identity/risk/policy context and is asked for:

- one supported decision outcome
- a concise rationale
- a confidence score

The response is validated before becoming a decision:

- outcome must be one of `APPROVE`, `FLAG_FOR_REVIEW`, `RECOMMEND_REVOCATION`, or `AUTO_REMEDIATE`
- rationale must be non-empty
- confidence must be numeric and bounded to 0–1

If the Claude call fails or returns malformed output, the system falls back to deterministic heuristics rather than emitting an unvalidated model decision.

The public UI exposes the resulting `decisionProvider` so an operator can distinguish Claude-backed decisions from other providers.

## Demo scenario

The canonical demo is an intern receiving `production-db.admin`.

The workflow demonstrates:

1. identity context
2. contextual risk
3. policy conflict
4. model-assisted decisioning
5. remediation controls
6. retained evidence

## Security posture

The public demonstration intentionally uses sample data.

- API credentials are expected to remain server-side environment variables.
- Model output is validated before entering remediation.
- Sensitive remediation remains operator-controlled.
- The project does not claim SOC 2, ISO 27001, or other external certification on the public site.

## Local development

### Backend

```bash
cd agentic-iam-backend
npm install
npm run build
npm start
```

### Frontend

```bash
cd agentic-iam-ui
npm install
npm run dev
```

Configure the backend environment when using Claude:

```bash
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

## Why the repository is public

The product is early-stage and intentionally reviewable. The public repository exposes the orchestration, decision path, deployment configuration, and frontend demo so technical reviewers can inspect how the system works rather than relying on marketing claims alone.
