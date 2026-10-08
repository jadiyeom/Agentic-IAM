export type IdentitySeniority = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';

export type IdentityType = 'HUMAN' | 'SERVICE' | 'AI_AGENT';

export interface IdentityAttributes {
  department: string;
  title: string;
  seniority: IdentitySeniority;
  employmentType: 'FULL_TIME' | 'CONTRACTOR' | 'INTERN' | 'AUTOMATION';
  location: string;
  /** Human, service account, or autonomous AI agent. Defaults to HUMAN. */
  identityType?: IdentityType;
  /** Accountable human owner, required in practice for SERVICE and AI_AGENT identities. */
  owner?: string;
}

export interface IdentityStateSnapshot {
  timestamp: number;
  roles: string[];
  entitlements: string[];
  riskScore: number;
  status: 'NORMAL' | 'ANOMALY';
}

export interface Identity {
  id: string;
  name: string;
  attributes: IdentityAttributes;
  roles: string[];
  entitlements: string[];
  history: IdentityStateSnapshot[];
}

