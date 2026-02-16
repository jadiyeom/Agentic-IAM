import { IdentityMonitoringAgent } from './IdentityAgent';
import { DecisionOutcome } from './DecisionAgent';

export interface RemediationAction {
  id: string;
  identityId: string;
  type: 'REVOKE_ACCESS' | 'DOWNGRADE_ROLES' | 'CREATE_REVIEW_TASK' | 'IGNORED';
  decisionOutcome: DecisionOutcome;
  timestamp: number;
  details: Record<string, unknown>;
}

export class RemediationAgent {
  private auditLog: RemediationAction[] = [];

  constructor(private identityAgent: IdentityMonitoringAgent) {}

  getActions(): RemediationAction[] {
    return [...this.auditLog];
  }

  autoRemediate(identityId: string, outcome: DecisionOutcome): RemediationAction | null {
    const snapshot = this.identityAgent.getSnapshot();
    const identity = snapshot.identities.get(identityId);
    if (!identity) return null;

    // Get original (seeded) roles/entitlements for this identity
    let originalRoles: string[] = [];
    let originalEntitlements: string[] = [];
    try {
      // Dynamically import seedIdentities to avoid circular deps
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { seedIdentities } = require('../seed');
      const original = seedIdentities().find((i: any) => i.id === identityId);
      if (original) {
        originalRoles = original.roles || [];
        originalEntitlements = original.entitlements || [];
      }
    } catch {}

    if (outcome === 'AUTO_REMEDIATE' || outcome === 'RECOMMEND_REVOCATION') {
      const previousRoles = [...identity.roles];
      const revokedRoles: string[] = [];

      for (const roleId of previousRoles) {
        if (!originalRoles.includes(roleId)) {
          this.identityAgent.revokeRole(identityId, roleId);
          revokedRoles.push(roleId);
        }
      }
      // (Optional) If you want to handle entitlements similarly, add logic here

      const action: RemediationAction = {
        id: `auto-${Date.now()}-${identityId}`,
        identityId,
        type: 'REVOKE_ACCESS',
        decisionOutcome: outcome,
        timestamp: Date.now(),
        details: {
          revokedRoles,
        },
      };
      this.auditLog.push(action);
      return action;
    }

    if (outcome === 'FLAG_FOR_REVIEW') {
      const action: RemediationAction = {
        id: `review-${Date.now()}-${identityId}`,
        identityId,
        type: 'CREATE_REVIEW_TASK',
        decisionOutcome: outcome,
        timestamp: Date.now(),
        details: {
          message: 'Access review task created by RemediationAgent.',
        },
      };
      this.auditLog.push(action);
      return action;
    }

    return null;
  }

  recordIgnored(identityId: string, outcome: DecisionOutcome, reason: string): RemediationAction {
    const action: RemediationAction = {
      id: `ignored-${Date.now()}-${identityId}`,
      identityId,
      type: 'IGNORED',
      decisionOutcome: outcome,
      timestamp: Date.now(),
      details: { reason },
    };
    this.auditLog.push(action);
    return action;
  }
}

