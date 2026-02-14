## Agentic IAM Backend

This service implements an agentic Identity & Access Management backend with autonomous agents for risk evaluation, policy compliance, decisioning, remediation, and audit explainability.

### Architecture

- **IdentityMonitoringAgent** (`agents/IdentityAgent.ts`): Maintains identities, roles, entitlements, and state history, and emits structured change events.
- **RiskEvaluationAgent** (`agents/RiskAgent.ts`): Computes 0–100 risk scores using role sensitivity, seniority alignment, peer-group comparison, and historical change patterns.
- **PolicyComplianceAgent** (`agents/PolicyAgent.ts`): Evaluates least privilege, segregation of duties (SoD), and role eligibility policies.
- **DecisionAgent** (`agents/DecisionAgent.ts`): Consumes risk and policy outputs plus identity context and produces a reasoned decision: APPROVE, FLAG_FOR_REVIEW, RECOMMEND_REVOCATION, or AUTO_REMEDIATE. Uses OpenAI when `OPENAI_API_KEY` is set, otherwise falls back to a heuristic model.
- **RemediationAgent** (`agents/RemediationAgent.ts`): Executes decisions by revoking access, downgrading roles, or creating review tasks, and logs all actions for audit.
- **AuditExplainabilityAgent** (`agents/AuditAgent.ts`): Produces natural-language explanations and audit records for each decision, optionally using OpenAI for richer text.
- **IAMOrchestrator** (`orchestrator/IAMController.ts`): Coordinates all agents, maintains metrics, and exposes a high-level API surface to the Express routes.

### API

All endpoints are prefixed with `/api`:

- **GET `/api/identities`**: Returns all identities with current risk, policy violations, decision outcome, audit explanation, and anomaly flag.
- **GET `/api/identities/:id`**: Returns full evaluation for a single identity.
- **POST `/api/simulate/anomaly`**: Assigns a role to an identity (e.g., giving an intern the production DB admin role) and re-evaluates its risk and policy profile.
  - Body: `{ "identityId": string, "roleId": string }`
- **POST `/api/identities/:id/actions`**: Applies remediation or overrides.
  - Body: `{ "action": "REVOKE_ACCESS" | "SEND_FOR_REVIEW" | "IGNORE", "decisionOutcome": string, "reason"?: string }`
- **GET `/api/metrics`**: Returns system metrics (anomaly count, policy violations, decision latency, overrides).
- **GET `/api/audit`**: Returns audit and explainability records.
- **GET `/api/remediation-log`**: Returns remediation actions taken.

### Simulation

Seed data includes an engineering intern, software engineer, production DBA, and finance identities, along with roles and policies that make a production DB admin role ineligible for interns and most departments.

To simulate the classic “intern with production admin role” anomaly, call:

```bash
curl -X POST http://localhost:4000/api/simulate/anomaly \
  -H "Content-Type: application/json" \
  -d '{"identityId":"id-intern-1","roleId":"role-prod-db-admin"}'
```

The system will:

- Increase the intern’s risk score based on role sensitivity, peer-group mismatch, and history.
- Flag least-privilege and role-eligibility policy violations.
- Produce a decision (typically `RECOMMEND_REVOCATION` or `AUTO_REMEDIATE`).
- Generate a human-readable explanation describing why this access is dangerous.

### Running

```bash
cd agentic-iam-backend
npm install
npm run build
npm start
```

For development:

```bash
npm run dev
```

Set `OPENAI_API_KEY` in a `.env` file to enable LLM-backed decisioning and explanations.

