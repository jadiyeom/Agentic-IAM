# Live identity connectors

Steerpast exposes a read-only connector registry through the backend. The public demo remains usable without any provider credentials; unconfigured connectors report which environment variables are missing.

## API

- `GET /api/connectors` — list connectors and configuration status. Never returns credential values.
- `GET /api/connectors/:id/status` — inspect one connector's setup status.
- `POST /api/connectors/:id/test` — make a small read-only provider API request to verify credentials.

Supported IDs: `entra`, `google-workspace`, `okta`, `aws-iam`, `github`.

## Environment

Copy the following variables into the backend deployment's secret/environment settings. Do not commit real credentials.

### Microsoft Entra ID
- `ENTRA_TENANT_ID`
- `ENTRA_CLIENT_ID`
- `ENTRA_CLIENT_SECRET`

Register an app in the tenant and grant only the Microsoft Graph **application permissions** required by the data you intend to sync. The connection test requests one user. Start with `User.Read.All`; expand permissions only when enabling additional resources. Admin consent is required.

### Google Workspace
- `GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_WORKSPACE_PRIVATE_KEY` (PEM private key; newlines may be represented as `\\n`)
- `GOOGLE_WORKSPACE_ADMIN_EMAIL`

Enable the Admin SDK Directory API, configure domain-wide delegation, and authorize the Directory API user-readonly scope. The connection test requests at most one user. Keep the service account key in a secret manager.

### Okta
- `OKTA_ORG_URL` (for example, `https://your-org.okta.com`)
- `OKTA_API_TOKEN`

Use a dedicated least-privilege service account and a read-only API token. The test requests at most one user. Sync reads users, groups, apps and the last seven days of System Log events.

### AWS IAM
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (for example, `us-east-1`)
- Optional: `AWS_SESSION_TOKEN` for temporary credentials

Use a dedicated IAM principal with only the read permissions required for the enabled sync jobs. The test calls IAM `GetUser`; if the credential represents a role/session without an IAM user, use a principal whose test permissions and identity model are appropriate. Do not use root credentials. Sync lists IAM users, roles and policies; CloudTrail is a separate follow-up.

### GitHub
- `GITHUB_TOKEN`
- `GITHUB_ORG`

Use a fine-grained token or GitHub App installation token with read-only organization/member/repository permissions. The current test verifies the token via `GET /user`; organization-specific sync must separately verify access to the configured `GITHUB_ORG`.

## Current scope and safety

This is the initial connector onboarding layer: registry, environment-based readiness, and live read-only connection tests. It does **not yet ingest or persist full directory snapshots**, subscribe to change events, or display connected-source data in the UI. Implement those as provider-specific sync jobs before treating a source as fully integrated.

- Provider credentials remain server-side and are never returned by the API.
- Test endpoints return generic upstream errors rather than raw provider response bodies.
- Use HTTPS in deployment, rotate credentials, and keep the configured scopes least-privileged.
- Google Workspace currently tests user-directory read access only; add separately scoped adapters before syncing groups or organizational units.
