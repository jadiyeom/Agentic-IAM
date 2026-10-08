/**
 * Single source of truth for how a 0–100 composite risk score maps to a tier.
 * The UI mirrors these thresholds in agentic-iam-ui/src/components/ui.tsx.
 */
export const RISK_TIERS = {
  /** Scores at or above this are HIGH. */
  high: 50,
  /** Scores at or above this (and below `high`) are MEDIUM. */
  medium: 25,
} as const;

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export function riskTier(score: number): RiskTier {
  if (score >= RISK_TIERS.high) return 'HIGH';
  if (score >= RISK_TIERS.medium) return 'MEDIUM';
  return 'LOW';
}
