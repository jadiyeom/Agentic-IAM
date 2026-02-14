export type IdentitySeniority = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';

export interface IdentityAttributes {
  department: string;
  title: string;
  seniority: IdentitySeniority;
  employmentType: 'FULL_TIME' | 'CONTRACTOR' | 'INTERN';
  location: string;
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

