## Agentic IAM Platform (Backend + UI)

This workspace contains a research-grade, agentic Identity & Access Management system implemented in TypeScript.

- **Backend (`agentic-iam-backend`)**: Node.js/Express service hosting IAM domain models and autonomous agents:
  - `IdentityMonitoringAgent` tracks identities, roles, entitlements, and state history.
  - `RiskEvaluationAgent` computes contextual 0–100 risk scores using role sensitivity, seniority alignment, peer-group comparison, and historical volatility.
  - `PolicyComplianceAgent` enforces least privilege, segregation of duties (SoD), and role eligibility.
  - `DecisionAgent` fuses risk, policy, and identity context into reasoned outcomes (APPROVE, FLAG_FOR_REVIEW, RECOMMEND_REVOCATION, AUTO_REMEDIATE), optionally using OpenAI for truly agentic behavior.
  - `RemediationAgent` executes revocations/downgrades and creates review tasks, emitting an audit log.
  - `AuditExplainabilityAgent` generates human-readable explanations for each decision and maintains an audit trail.
  - `IAMOrchestrator` coordinates all agents and exposes a JSON API, plus anomaly simulation and metrics.

- **Frontend (`agentic-iam-ui`)**: React + TypeScript dashboard:
  - Identity overview table with anomaly highlighting and risk badges.
  - Detail side panel with violated policies, decision outcome, and explainability text.
  - Animated decision flow (Identity → Risk → Policy → Decision) using Framer Motion and Recharts.
  - Remediation controls (revoke, review, ignore with justification) wired to backend APIs.
  - Research metrics panel for anomaly detection counts, overrides, and mean decision time.

### Running the system

1. **Start the backend**:

```bash
cd agentic-iam-backend
npm install
npm run build
npm start
```

2. **Start the UI** (in a second terminal):

```bash
cd agentic-iam-ui
npm install
npm run dev
```

3. Open the dashboard (default Vite port is `5173`) and use the red
   “Simulate Intern → Prod DB Admin” button to trigger the classic anomaly
   scenario. Watch risk, policy violations, decision outcome, and explanation
   update end-to-end.

Set `OPENAI_API_KEY` in `agentic-iam-backend/.env` to enable LLM-backed decisioning and explainability; without it the system falls back to deterministic heuristics while preserving the same JSON contracts.

