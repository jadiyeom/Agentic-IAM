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
- **RiskAgent** — contextual 0–100 risk evaluation with autonomous AI agent blast radius scoring
- **PolicyAgent** — least privilege, segregation of duties (SoD), role eligibility, toxic combinations, and AI agent governance
- **DecisionAgent** — decision synthesis with multi-provider LLM integration (Google Gemini, Anthropic Claude, OpenAI, or deterministic heuristics)
- **RemediationAgent** — controlled corrective actions, targeted revocation, and emergency identity quarantine
- **AuditAgent** — evidence and decision history with LLM-assisted explainability
- **IAMOrchestrator** — coordinates the end-to-end workflow, pre-flight "What-If" simulations, and declarative policy management

The frontend is React + TypeScript with a security workspace for identities, entitlements, security policies, explainability/audit, pre-flight access request simulation, and system metrics.

## Multi-LLM integration

Steerpast IAM supports multiple first-class LLM providers with automatic fallback to deterministic heuristics:

- **Google Gemini** — set `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) and optionally `GEMINI_MODEL` (default: `gemini-2.5-flash`).
- **Anthropic Claude** — set `ANTHROPIC_API_KEY` and optionally `ANTHROPIC_MODEL` (default: `claude-sonnet-4-5`).
- **OpenAI** — set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` (default: `gpt-4o-mini`).
- **Deterministic Heuristics** — runs automatically when no API keys are present (default in offline test environments).

The model receives structured identity/risk/policy context and is asked for:

- one supported decision outcome (`APPROVE`, `FLAG_FOR_REVIEW`, `RECOMMEND_REVOCATION`, or `AUTO_REMEDIATE`)
- a concise rationale
- a confidence score (0–1)

The response is strictly validated and cached keyed on immutable facts (attributes, roles, risk score, violations) so unchanged identities are never re-billed. Every decision records `decisionProvider`, `model`, and `latencyMs`.

## Pre-flight "What-If" Access Request Sandbox

Rather than waiting for anomalous privileges to be granted, operators and automated workflows can simulate access requests **pre-flight**:

- `POST /api/simulate/access-request`
- Input: `{ identityId, roleId, justification }`
- Output: Baseline vs Projected Risk ($\Delta$ risk score), triggered policy violations, and AI agent recommendation (`SAFE_TO_GRANT`, `NEEDS_MANAGER_APPROVAL`, or `REJECT_POLICY_CONFLICT`).
- UI includes an interactive simulator modal reachable directly from the Identities workspace or with <kbd>⌘K</kbd>.

## Demo scenarios

The seeded workspace (15 identities, including three AI agents) contains five key security scenarios:

| Identity | Situation | Decision |
| --- | --- | --- |
| Kabir, deployment intern | Holds Production Database Admin | Recommend revocation (role eligibility, critical) |
| Nikhil, finance contractor | Holds both Finance Analyst and Finance Approver | Recommend revocation (segregation of duties) |
| `release-agent` (AI agent) | DevOps role with production and cloud access | Flag for owner review |
| `support-agent` (AI agent) | Scoped support role | Approve |
| `crawler-agent` (AI agent) | Unowned autonomous agent holding Cloud Root Admin | Auto-remediate / Recommend revocation (unowned agent breach) |

In the workspace:
- **Simulate access request**: Run pre-flight What-If simulations for any identity and role.
- **Run the intern scenario**: Grants production DB admin to an intern live to observe end-to-end agent reactivity.
- **Security Policies**: Dynamically inspect, enable, disable, and author policies.
- Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> to jump anywhere or reset demo data.

The canonical workflow demonstrates:

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

## API hardening

- Input validation on every write, 32 kb body limit, JSON errors for malformed bodies
- Security headers (`nosniff`, `DENY` framing, strict referrer, `no-store`)
- Per-IP rate limit on writes for the public demo
- `GET /api/health` (pipeline status, decision provider, model, uptime) and `POST /api/reset` (restore the seeded data)

## Tests

```bash
cd agentic-iam-backend && npm test
```

Jest covers each demo scenario end to end, targeted revocation, reset, and rejection of malformed model output. CI runs the UI build, backend build and tests on every push.

## Local development

Install root dependencies once (`npm install` at the repo root), then:

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
