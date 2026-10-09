import express from 'express';
import { createHash, createHmac, createSign } from 'node:crypto';

type ConnectorId = 'entra' | 'google-workspace' | 'okta' | 'aws-iam' | 'github';
type ConnectorDefinition = {
  id: ConnectorId;
  name: string;
  category: string;
  description: string;
  env: string[];
  scopes: string[];
  capabilities: string[];
  setupUrl: string;
};

const CONNECTORS: ConnectorDefinition[] = [
  {
    id: 'entra', name: 'Microsoft Entra ID', category: 'identity-provider',
    description: 'Directory users, group membership, directory roles and service principals, plus recent audit events.',
    env: ['ENTRA_TENANT_ID', 'ENTRA_CLIENT_ID', 'ENTRA_CLIENT_SECRET'],
    scopes: ['User.Read.All', 'Group.Read.All', 'Application.Read.All', 'Directory.Read.All', 'RoleManagement.Read.Directory', 'AuditLog.Read.All'],
    capabilities: ['users', 'groups', 'service-principals', 'applications'],
    setupUrl: 'https://learn.microsoft.com/en-us/graph/overview'
  },
  {
    id: 'google-workspace', name: 'Google Workspace', category: 'identity-provider',
    description: 'Directory users, group membership, organizational units, admin roles and recent audit events.',
    env: ['GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_WORKSPACE_PRIVATE_KEY', 'GOOGLE_WORKSPACE_ADMIN_EMAIL'],
    scopes: ['admin.directory.user.readonly', 'admin.directory.group.readonly', 'admin.directory.orgunit.readonly', 'admin.directory.rolemanagement.readonly', 'admin.reports.audit.readonly'],
    capabilities: ['users', 'groups', 'organizational-units'],
    setupUrl: 'https://developers.google.com/workspace/admin/directory/v1/guides/authorizing'
  },
  {
    id: 'okta', name: 'Okta', category: 'identity-provider',
    description: 'Users, groups, application assignments and System Log events.',
    env: ['OKTA_ORG_URL', 'OKTA_API_TOKEN'],
    scopes: ['Read-only API token recommended'],
    capabilities: ['users', 'groups', 'applications', 'system-log'],
    setupUrl: 'https://developer.okta.com/docs/reference/api/overview/'
  },
  {
    id: 'aws-iam', name: 'AWS IAM', category: 'cloud-identity',
    description: 'IAM identity and account metadata via signed AWS API requests.',
    env: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    scopes: ['iam:GetUser (connection test)', 'iam:ListUsers', 'iam:ListRoles', 'iam:ListPolicies'],
    capabilities: ['users', 'roles', 'policies', 'account-identity'],
    setupUrl: 'https://docs.aws.amazon.com/IAM/latest/APIReference/'
  },
  {
    id: 'github', name: 'GitHub', category: 'developer-access',
    description: 'Organization members, teams, repository permissions and available audit events.',
    env: ['GITHUB_TOKEN', 'GITHUB_ORG'],
    scopes: ['Read-only organization and repository permissions'],
    capabilities: ['current-user', 'organization-members', 'teams', 'repositories'],
    setupUrl: 'https://docs.github.com/en/rest'
  }
];

function configured(definition: ConnectorDefinition): boolean {
  return definition.env.every((key) => Boolean(process.env[key]?.trim()));
}

function safeConfig(definition: ConnectorDefinition) {
  return {
    id: definition.id,
    name: definition.name,
    category: definition.category,
    description: definition.description,
    configured: configured(definition),
    missingEnvironment: definition.env.filter((key) => !process.env[key]?.trim()),
    capabilities: definition.capabilities,
    setupUrl: definition.setupUrl
  };
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function googleAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_WORKSPACE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = process.env.GOOGLE_WORKSPACE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: email,
    sub: process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL!,
    scope: 'https://www.googleapis.com/auth/admin.directory.user.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));
  const unsigned = header + '.' + claim;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = unsigned + '.' + base64url(signer.sign(privateKey));
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('Google OAuth token exchange failed (' + response.status + ')');
  const body = await response.json() as { access_token?: string };
  if (!body.access_token) throw new Error('Google OAuth response did not include an access token');
  return body.access_token;
}

async function entraToken(): Promise<string> {
  const tenant = process.env.ENTRA_TENANT_ID!;
  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.ENTRA_CLIENT_ID!,
      client_secret: process.env.ENTRA_CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('Microsoft Entra token exchange failed (' + response.status + ')');
  const body = await response.json() as { access_token?: string };
  if (!body.access_token) throw new Error('Microsoft Entra OAuth response did not include an access token');
  return body.access_token;
}

function awsSignature(method: string, host: string, path: string, query: string, body: string, region: string, service: string, amzDate: string, dateStamp: string) {
  const accessKey = process.env.AWS_ACCESS_KEY_ID!;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY!;
  const payloadHash = createHash('sha256').update(body).digest('hex');
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n` + (process.env.AWS_SESSION_TOKEN ? `x-amz-security-token:${process.env.AWS_SESSION_TOKEN}\n` : '');
  const signedHeaders = process.env.AWS_SESSION_TOKEN ? 'host;x-amz-date;x-amz-security-token' : 'host;x-amz-date';
  const canonicalRequest = [method, path, query, canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
  const hmac = (key: string | Buffer, value: string) => createHmac('sha256', key).update(value).digest();
  const kDate = hmac('AWS4' + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  return `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function testConnection(id: ConnectorId): Promise<{ ok: true; message: string; checkedAt: string }> {
  let response: Response;
  if (id === 'entra') {
    const token = await entraToken();
    response = await fetch('https://graph.microsoft.com/v1.0/users?$top=1&$select=id', {
      headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000)
    });
  } else if (id === 'google-workspace') {
    const token = await googleAccessToken();
    response = await fetch('https://admin.googleapis.com/admin/directory/v1/users?customer=my_customer&maxResults=1&projection=basic', {
      headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000)
    });
  } else if (id === 'okta') {
    const origin = process.env.OKTA_ORG_URL!.replace(/\/$/, '');
    response = await fetch(`${origin}/api/v1/users?limit=1`, {
      headers: { authorization: `SSWS ${process.env.OKTA_API_TOKEN}`, accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
  } else if (id === 'github') {
    response = await fetch('https://api.github.com/user', {
      headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
      signal: AbortSignal.timeout(10000)
    });
  } else {
    const region = process.env.AWS_REGION || 'us-east-1';
    const host = `iam.${region}.amazonaws.com`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const body = 'Action=GetUser&Version=2010-05-08';
    const signature = awsSignature('POST', host, '/', '', body, region, 'iam', amzDate, dateStamp);
    const headers: Record<string, string> = {
      authorization: signature,
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      host,
      'x-amz-date': amzDate
    };
    if (process.env.AWS_SESSION_TOKEN) headers['x-amz-security-token'] = process.env.AWS_SESSION_TOKEN;
    response = await fetch(`https://${host}/`, {
      method: 'POST', headers, body, signal: AbortSignal.timeout(10000)
    });
  }

  if (!response.ok) {
    // Do not return upstream bodies: they may contain tenant-specific details.
    throw new Error('Provider rejected the connection test (' + response.status + ')');
  }
  return { ok: true, message: 'Read-only connection test succeeded', checkedAt: new Date().toISOString() };
}

export function createConnectorRouter() {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json(CONNECTORS.map(safeConfig));
  });

  router.get('/:id/status', (req, res) => {
    const connector = CONNECTORS.find((item) => item.id === req.params.id);
    if (!connector) {
      res.status(404).json({ error: 'Unknown connector' });
      return;
    }
    res.json(safeConfig(connector));
  });

  router.post('/:id/test', async (req, res) => {
    const connector = CONNECTORS.find((item) => item.id === req.params.id);
    if (!connector) {
      res.status(404).json({ error: 'Unknown connector' });
      return;
    }
    if (!configured(connector)) {
      res.status(400).json({
        error: 'Connector is not configured',
        missingEnvironment: connector.env.filter((key) => !process.env[key]?.trim())
      });
      return;
    }
    try {
      res.json({ connectorId: connector.id, ...(await testConnection(connector.id)) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection test failed';
      res.status(502).json({ connectorId: connector.id, ok: false, error: message });
    }
  });

  return router;
}
