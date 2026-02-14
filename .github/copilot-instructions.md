# Copilot Instructions for Agentic IAM Project

## Overview
This monorepo implements an agentic Identity & Access Management (IAM) system with autonomous agents for risk, policy, decisioning, remediation, and explainability. It consists of two main parts:
- **agentic-iam-backend/**: Node.js/TypeScript backend with agent-based architecture
- **agentic-iam-ui/**: React/TypeScript dashboard UI

## Architecture & Key Patterns
- **Backend agents** (in `src/agents/`): Each agent (Identity, Risk, Policy, Decision, Remediation, Audit) is a TypeScript class with a single responsibility. Agents communicate via method calls, not events or queues.
- **Orchestration**: `src/orchestrator/IAMController.ts` coordinates agent calls and exposes a high-level API to `src/api/routes.ts`.
- **Models**: All identity, role, entitlement, and policy data models are in `src/models/`.
- **API**: All endpoints are under `/api` (see backend README for details). The backend is stateless and expects all state to be in-memory or seeded at startup.
- **Simulation**: Use the `/api/simulate/anomaly` endpoint to trigger classic IAM anomalies (e.g., intern with prod admin role).

## Developer Workflows
- **Backend**:
  - Install: `cd agentic-iam-backend && npm install`
  - Run: `npm start` (default port 4000)
  - Test: (if tests exist) `npm test`
  - Seed: `npm run seed` (optional, see `src/seed.ts`)
- **Frontend**:
  - Install: `cd agentic-iam-ui && npm install`
  - Run: `npm run dev` (Vite, port 5173)
  - The UI proxies `/api` to `localhost:4000` by default

## Project Conventions
- **TypeScript everywhere** (strict mode recommended)
- **No database**: All data is in-memory for simulation/demo purposes
- **Agent methods**: Prefer pure functions, avoid side effects except for logging/audit
- **Remediation actions**: Always log to audit trail via AuditAgent
- **OpenAI integration**: If `OPENAI_API_KEY` is set, DecisionAgent and AuditAgent use LLMs for richer output; otherwise, fallback to heuristics
- **UI**: Use React functional components, Tailwind CSS, and Framer Motion for animation

## Integration Points
- **API contract**: UI expects backend at `/api` (see backend README for endpoints)
- **Remediation and audit**: All actions and decisions should be traceable via `/api/audit` and `/api/remediation-log`

## References
- Backend: `agentic-iam-backend/README.md`
- Frontend: `agentic-iam-ui/README.md`
- Key backend files: `src/agents/`, `src/orchestrator/IAMController.ts`, `src/api/routes.ts`, `src/models/`
- Key frontend files: `src/components/`, `src/pages/Dashboard.tsx`, `src/services/iamApi.ts`

---
For new patterns or changes, update this file to keep AI agents productive and aligned with project conventions.
