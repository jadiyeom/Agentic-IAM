export type RoleSensitivity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Role {
  id: string;
  name: string;
  description: string;
  sensitivity: RoleSensitivity;
  // High-level domains the role touches, e.g. "PRODUCTION_DB", "CUSTOMER_DATA"
  domains: string[];
}

