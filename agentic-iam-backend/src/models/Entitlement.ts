export interface Entitlement {
  id: string;
  name: string;
  description: string;
  // Logical grouping, e.g. "DATABASE", "CLOUD_CONSOLE", "HR_SYSTEM"
  category: string;
  // Optional mapping to concrete systems/resources
  resource?: string;
}

