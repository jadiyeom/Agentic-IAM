import { Identity } from '../models/Identity';
import { Role } from '../models/Role';
import { IdentityMonitoringState } from './IdentityAgent';

export interface RiskFactors {
  roleSensitivityScore: number;
  seniorityAlignmentScore: number;
  peerAnomalyScore: number;
  historicalChangeScore: number;
}

export interface RiskEvaluationResult {
  identityId: string;
  riskScore: number; // 0-100
  factors: RiskFactors;
  contextSummary: string;
}

export class RiskEvaluationAgent {
  evaluateIdentity(identity: Identity, state: IdentityMonitoringState): RiskEvaluationResult {
    const roles = identity.roles
      .map((id) => state.roles.get(id))
      .filter((r): r is Role => !!r);

    // Role sensitivity: map qualitative sensitivity to numeric and aggregate.
    const sensitivityWeights: Record<Role['sensitivity'], number> = {
      LOW: 0.1,
      MEDIUM: 0.4,
      HIGH: 0.7,
      CRITICAL: 1.0,
    };

    const maxPossibleSensitivityScore = 100;
    const rawSensitivity = roles.reduce(
      (sum, role) => sum + sensitivityWeights[role.sensitivity] * 25,
      0
    );
    const roleSensitivityScore = Math.min(rawSensitivity, maxPossibleSensitivityScore);

    // Seniority alignment: compare seniority vs aggregate sensitivity level.
    const seniorityOrder: Identity['attributes']['seniority'][] = [
      'INTERN',
      'JUNIOR',
      'MID',
      'SENIOR',
      'EXECUTIVE',
    ];

    const avgSensitivityLevel =
      roles.length === 0
        ? 0
        : roles.reduce((sum, role) => {
            switch (role.sensitivity) {
              case 'LOW':
                return sum + 0;
              case 'MEDIUM':
                return sum + 1;
              case 'HIGH':
                return sum + 2;
              case 'CRITICAL':
                return sum + 3;
              default:
                return sum;
            }
          }, 0) / roles.length;

    const seniorityIndex = seniorityOrder.indexOf(identity.attributes.seniority);
    const expectedIndexForSensitivity = Math.min(4, Math.round(avgSensitivityLevel + 1)); // ~MEDIUM->JUNIOR/MID, HIGH->SENIOR, CRITICAL->EXECUTIVE
    const misalignment = Math.max(0, expectedIndexForSensitivity - seniorityIndex);
    const seniorityAlignmentScore = misalignment * 20; // each level of mismatch adds 20 risk

    // Peer anomaly: compare role set to peers sharing department and similar seniority.
    const peers = Array.from(state.identities.values()).filter((peer) => {
      if (peer.id === identity.id) return false;
      return peer.attributes.department === identity.attributes.department;
    });

    let peerAnomalyScore = 0;
    if (peers.length > 0) {
      const roleFrequency: Record<string, number> = {};
      for (const peer of peers) {
        for (const roleId of peer.roles) {
          roleFrequency[roleId] = (roleFrequency[roleId] ?? 0) + 1;
        }
      }
      const rareRoles = identity.roles.filter((roleId) => {
        const freq = roleFrequency[roleId] ?? 0;
        return freq === 0;
      });
      // More rare roles -> higher anomaly. Cap at 40.
      peerAnomalyScore = Math.min(rareRoles.length * 10, 40);
    }

    // Historical change score: frequent privilege changes increase risk.
    const history = identity.history;
    let historicalChangeScore = 0;
    if (history.length > 1) {
      const windowMs = 7 * 24 * 60 * 60 * 1000; // last 7 days
      const now = Date.now();
      const recent = history.filter((h) => now - h.timestamp <= windowMs);
      const changeCount = recent.length;
      historicalChangeScore = Math.min(changeCount * 5, 30);
    }

    const totalRisk = Math.min(
      roleSensitivityScore * 0.4 +
        seniorityAlignmentScore * 0.3 +
        peerAnomalyScore * 0.2 +
        historicalChangeScore * 0.1,
      100
    );

    const contextSummary = [
      `roleSensitivity=${roleSensitivityScore.toFixed(1)}`,
      `seniorityAlignment=${seniorityAlignmentScore.toFixed(1)}`,
      `peerAnomaly=${peerAnomalyScore.toFixed(1)}`,
      `historicalChange=${historicalChangeScore.toFixed(1)}`,
    ].join(', ');

    return {
      identityId: identity.id,
      riskScore: Math.round(totalRisk),
      factors: {
        roleSensitivityScore,
        seniorityAlignmentScore,
        peerAnomalyScore,
        historicalChangeScore,
      },
      contextSummary,
    };
  }
}

