## Agentic IAM Backend

This service implements an agentic Identity & Access Management backend with autonomous agents for risk evaluation, policy compliance, decisioning, remediation, and audit explainability.

### Architecture

- **IdentityMonitoringAgent** (`agents/IdentityAgent.ts`): Maintains identities, roles, entitlements, and state history, and emits structured change events.
- **RiskEvaluationAgent** (`agents/RiskAgent.ts`): Computes 0–100 risk scores using role sensitivity, seniority alignment, peer-group comparison, and historical change patterns.
- **PolicyComplianceAgent** (`agents/PolicyAgent.ts`): Evaluates least privilege, segregation of duties (SoD), and role eligibility policies.
- **DecisionAgent** (`agents/DecisionAgent.ts`): Consumes risk and policy outputs plus identity context and produces a reasoned decision: APPROVE, FLAG_FOR_REVIEW, RECOMMEND_REVOCATION, or AUTO_REMEDIATE. Uses Claude when `ANTHROPIC_API_KEY` is set, otherwise falls back to deterministic heuristics. The active provider is exposed as `decisionProvider` in the API response.
- **RemediationAgent** (`agents/RemediationAgent.ts`): Executes decisions by revoking access, downgrading roles, or creating review tasks, and logs all actions for audit.
- **AuditExplainabilityAgent** (`agents/AuditAgent.ts`): Produces natural-language explanations and audit records for each decision, using the project's explainability layer and retained audit context.
- **IAMOrchestrator** (`orchestrator/IAMController.ts`): Coordinates all agents and exposes the high-level API surface to the Express routes.
- **Live connector registry** (`src/connectors.ts`): Lists Entra ID, Google Workspace, Okta, AWS IAM and GitHub; reports environment readiness; and provides read-only connection-test endpoints.

### Live identity connectors

Connector endpoints:
- **GET `/api/connectors`**: List providers and readiness without exposing secrets.
- **GET `/api/connectors/:id/status`**: Check one provider's setup status.
- **POST `/api/connectors/:id/test`**: Perform a minimal live read-only API check.

Supported IDs: `entra`, `google-workspace`, `okta`, `aws-iam`, `github`.

Copy `agentic-iam-backend/.env.example` as a reference and configure credentials in your local secret environment or deployment settings. Never commit real keys. See [Live connector onboarding](../docs/live-connectors.md) for provider setup, least-privilege guidance, and current scope.

**Important:** This is the first onboarding layer (registry, readiness and live connection tests). Full directory ingestion, incremental sync, event subscriptions, and connected-source UI are not implemented yet.

### API

All endpoints are prefixed with `/api`:
- **GET `/api/identities`**: Returns all identities with current risk, policy violations, decision outcome, audit explanation, and anomaly flag.
- **GET `/api/identities/:id`**: Returns full evaluation for a single identity.
- **POST `/api/simulate/anomaly`**: Assigns a role to an identity and re-evaluates its risk and policy profile.
- **POST `/api/identities/:id/actions`**: Applies remediation or overrides.
- **GET `/api/metrics`**: Returns system metrics.
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

### Running

```bash
cd agentic-iam-backend
npm install
npm run build
npm start
```

For development, run `npm run dev`. Set `ANTHROPIC_API_KEY` to enable Claude-backed decisioning; optionally set `ANTHROPIC_MODEL` (default: `claude-sonnet-4-5`). The key is server-side only.
