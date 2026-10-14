import axios from 'axios';

export type DecisionOutcome = 'APPROVE' | 'FLAG_FOR_REVIEW' | 'RECOMMEND_REVOCATION' | 'AUTO_REMEDIATE';

export interface IdentityAttributes {
  department: string;
  title: string;
  seniority: 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  employmentType: 'FULL_TIME' | 'CONTRACTOR' | 'INTERN' | 'AUTOMATION';
  location: string;
  identityType?: 'HUMAN' | 'SERVICE' | 'AI_AGENT';
  owner?: string;
}

export interface Identity {
  id: string;
  name: string;
  attributes: IdentityAttributes;
  roles: string[];
  entitlements: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  domains: string[];
}

export interface RiskFactors {
  roleSensitivityScore: number;
  seniorityAlignmentScore: number;
  peerAnomalyScore: number;
  historicalChangeScore: number;
  agentGovernanceScore?: number;
}

export interface RiskEvaluationResult {
  identityId: string;
  riskScore: number;
  factors: RiskFactors;
  contextSummary: string;
}

export type PolicyType = 'LEAST_PRIVILEGE' | 'SOD' | 'ROLE_ELIGIBILITY' | 'AI_AGENT_GOVERNANCE' | 'TOXIC_COMBINATION';

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyType: PolicyType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  identityId: string;
  violations: PolicyViolation[];
}

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  description: string;
  enabled?: boolean;
  config: Record<string, unknown>;
}

export interface DecisionResult {
  identityId: string;
  outcome: DecisionOutcome;
  rationale: string;
  confidence: number;
  usedLLM: boolean;
  decisionProvider: 'gemini' | 'openai' | 'claude' | 'huggingface' | 'heuristic';
  model?: string;
  latencyMs?: number;
  cached?: boolean;
  fallbackReason?: string;
}

export interface AuditRecord {
  id: string;
  identityId: string;
  timestamp: number;
  decision: DecisionResult;
  risk: RiskEvaluationResult;
  policy: PolicyEvaluationResult;
  explanation: string;
}

export interface IdentityViewModel {
  identity: Identity;
  risk: RiskEvaluationResult;
  policy: PolicyEvaluationResult;
  decision: DecisionResult;
  audit: AuditRecord;
  anomaly: boolean;
  remediationStatus?: {
    type: string;
    timestamp: number;
    details?: Record<string, unknown>;
  };
}

export interface Metrics {
  totalDecisions: number;
  anomaliesDetected: number;
  policyViolationsDetected: number;
  decisionsOverridden: number;
  cumulativeDecisionTimeMs: number;
}

export interface AccessRequestSimulation {
  identityId: string;
  identityName: string;
  requestedRole: {
    id: string;
    name: string;
    sensitivity: string;
    domains: string[];
  };
  justification: string;
  baseline: {
    riskScore: number;
    violationsCount: number;
  };
  projected: {
    riskScore: number;
    riskDelta: number;
    violations: PolicyViolation[];
    newViolations: PolicyViolation[];
  };
  decision: DecisionResult;
  recommendation: 'SAFE_TO_GRANT' | 'NEEDS_MANAGER_APPROVAL' | 'REJECT_POLICY_CONFLICT';
}

// Fetch all identities
export async function fetchIdentities(): Promise<IdentityViewModel[]> {
  const res = await axios.get<IdentityViewModel[]>('/api/identities');
  return res.data;
}

// Fetch all roles
export async function fetchRoles(): Promise<Role[]> {
  const res = await axios.get<Role[]>('/api/roles');
  return res.data;
}

// Create a new identity
export async function createIdentity(identity: Omit<Identity, 'id'>): Promise<Identity> {
  const res = await axios.post<Identity>('/api/identities', identity);
  return res.data;
}

// Delete an identity
export async function deleteIdentity(identityId: string): Promise<void> {
  await axios.delete(`/api/identities/${identityId}`);
}

// Assign a role to an identity
export async function assignRoleToIdentity(identityId: string, roleId: string): Promise<Identity> {
  const res = await axios.post<Identity>(`/api/identities/${identityId}/roles`, { roleId });
  return res.data;
}

// Targeted revocation of a single role
export async function revokeRoleFromIdentity(identityId: string, roleId: string, reason?: string): Promise<any> {
  const res = await axios.delete(`/api/identities/${identityId}/roles/${roleId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
  return res.data;
}

// Quarantine identity
export async function quarantineIdentity(identityId: string, reason?: string): Promise<any> {
  const res = await axios.post(`/api/identities/${identityId}/quarantine`, { reason });
  return res.data;
}

// Simulate anomaly (landing page story)
export async function simulateAnomaly(identityId: string, roleId: string): Promise<IdentityViewModel> {
  const res = await axios.post<IdentityViewModel>('/api/simulate/anomaly', { identityId, roleId });
  return res.data;
}

// Pre-flight "What-If" access request simulation
export async function simulateAccessRequest(params: {
  identityId: string;
  roleId: string;
  justification?: string;
}): Promise<AccessRequestSimulation> {
  const res = await axios.post<AccessRequestSimulation>('/api/simulate/access-request', params);
  return res.data;
}

// Remediation action execution
export async function performRemediationAction(params: {
  identityId: string;
  action: 'REVOKE_ACCESS' | 'SEND_FOR_REVIEW' | 'IGNORE';
  decisionOutcome: DecisionOutcome;
  reason?: string;
}) {
  const res = await axios.post('/api/identities/' + params.identityId + '/actions', {
    action: params.action,
    decisionOutcome: params.decisionOutcome,
    reason: params.reason,
  });
  return res.data;
}

// Reset demo state
export async function resetDemo(): Promise<void> {
  await axios.post('/api/reset');
}

// Fetch metrics
export async function fetchMetrics(): Promise<Metrics> {
  const res = await axios.get<Metrics>('/api/metrics');
  return res.data;
}

export async function fetchRiskDistribution() {
  const res = await axios.get('/api/metrics/risk-distribution');
  return res.data;
}

export async function fetchDecisionVolume() {
  const res = await axios.get('/api/metrics/decision-volume');
  return res.data;
}

export async function fetchAgentHealth() {
  const res = await axios.get('/api/agent-status');
  return res.data;
}

export async function fetchAuditTimeline() {
  const res = await axios.get('/api/audit/timeline');
  return res.data;
}

export async function fetchAuditExport(format: 'json' | 'csv' = 'json') {
  const res = await axios.get(`/api/audit/export?format=${format}`, {
    responseType: format === 'csv' ? 'text' : 'json',
  });
  return res.data;
}

export async function fetchIdentityContext(identityId: string) {
  const res = await axios.get(`/api/identities/${identityId}/context`);
  return res.data;
}

export async function getEntitlements(): Promise<Role[]> {
  const res = await axios.get<Role[]>('/api/entitlements');
  return res.data;
}

export async function getDepartments() {
  const res = await axios.get('/api/departments');
  return res.data;
}

// Policies API
export async function fetchPolicies(): Promise<Policy[]> {
  const res = await axios.get<Policy[]>('/api/policies');
  return res.data;
}

export async function createPolicy(policy: Partial<Policy>): Promise<Policy> {
  const res = await axios.post<Policy>('/api/policies', policy);
  return res.data;
}

export async function updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
  const res = await axios.patch<Policy>(`/api/policies/${id}`, updates);
  return res.data;
}

export async function deletePolicy(id: string): Promise<void> {
  await axios.delete(`/api/policies/${id}`);
}
