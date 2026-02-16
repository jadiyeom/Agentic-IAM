// Role model for UI
export interface Role {
  id: string;
  name: string;
  description: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  domains: string[];
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
import axios from 'axios';

export type DecisionOutcome = 'APPROVE' | 'FLAG_FOR_REVIEW' | 'RECOMMEND_REVOCATION' | 'AUTO_REMEDIATE';

export interface IdentityAttributes {
  department: string;
  title: string;
  seniority: 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  employmentType: 'FULL_TIME' | 'CONTRACTOR' | 'INTERN';
  location: string;
}

export interface Identity {
  id: string;
  name: string;
  attributes: IdentityAttributes;
  roles: string[];
  entitlements: string[];
}

export interface RiskFactors {
  roleSensitivityScore: number;
  seniorityAlignmentScore: number;
  peerAnomalyScore: number;
  historicalChangeScore: number;
}

export interface RiskEvaluationResult {
  identityId: string;
  riskScore: number;
  factors: RiskFactors;
  contextSummary: string;
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyType: 'LEAST_PRIVILEGE' | 'SOD' | 'ROLE_ELIGIBILITY';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  identityId: string;
  violations: PolicyViolation[];
}

export interface DecisionResult {
  identityId: string;
  outcome: DecisionOutcome;
  rationale: string;
  confidence: number;
  usedLLM: boolean;
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
}

export interface Metrics {
  totalDecisions: number;
  anomaliesDetected: number;
  policyViolationsDetected: number;
  decisionsOverridden: number;
  cumulativeDecisionTimeMs: number;
}

export async function fetchIdentities(): Promise<IdentityViewModel[]> {
  const res = await axios.get<IdentityViewModel[]>('/api/identities');
  return res.data;
}

export async function simulateAnomaly(identityId: string, roleId: string): Promise<IdentityViewModel> {
  const res = await axios.post<IdentityViewModel>('/api/simulate/anomaly', { identityId, roleId });
  return res.data;
}

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

export async function fetchAuditExport() {
  const res = await axios.get('/api/audit/export');
  return res.data;
}

export async function fetchIdentityContext(identityId: string) {
  const res = await axios.get(`/api/identities/${identityId}/context`);
  return res.data;
}

// Fetch all entitlements
export async function getEntitlements() {
  const res = await axios.get('/api/entitlements');
  return res.data;
}

// Fetch all departments
export async function getDepartments() {
  const res = await axios.get('/api/departments');
  return res.data;
}

