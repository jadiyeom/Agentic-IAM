## Agentic IAM UI

React + TypeScript single-page dashboard for the agentic IAM backend.

### Features

- **Identity overview table** with departments, roles, risk scores, anomaly badges, and decision outcomes.
- **Detail side panel** showing policy violations, risk context, and natural-language explanations.
- **Animated decision flow** (Identity → Risk → Policy → Decision) using Framer Motion and Recharts.
- **Remediation controls** to revoke access, send for review, or ignore with justification.
- **Research metrics panel** summarizing anomaly counts, policy violations, overrides, and mean decision time.

### Running

```bash
cd agentic-iam-ui
npm install
npm run dev
```

The UI expects the backend to be running on `http://localhost:4000`; the Vite dev server proxies `/api` requests there.

