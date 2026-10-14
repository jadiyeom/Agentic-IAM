export type PolicyType = 'LEAST_PRIVILEGE' | 'SOD' | 'ROLE_ELIGIBILITY' | 'AI_AGENT_GOVERNANCE' | 'TOXIC_COMBINATION';

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyType: PolicyType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, unknown>;
}

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  description: string;
  enabled?: boolean;
  // Arbitrary configuration, e.g. SoD conflicting roles, eligibility rules, etc.
  config: Record<string, unknown>;
}

