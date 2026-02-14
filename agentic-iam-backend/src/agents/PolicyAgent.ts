import { Identity } from '../models/Identity';
import { Policy, PolicyViolation } from '../models/Policy';
import { Role } from '../models/Role';
import { IdentityMonitoringState } from './IdentityAgent';

export interface PolicyEvaluationResult {
  identityId: string;
  violations: PolicyViolation[];
}

export class PolicyComplianceAgent {
  constructor(private policies: Policy[]) {}

  getPolicyCount(): number {
    return this.policies.length;
  }

  evaluate(identity: Identity, state: IdentityMonitoringState): PolicyEvaluationResult {
    const violations: PolicyViolation[] = [];

    for (const policy of this.policies) {
      switch (policy.type) {
        case 'LEAST_PRIVILEGE':
          violations.push(...this.evaluateLeastPrivilege(identity, state, policy));
          break;
        case 'SOD':
          violations.push(...this.evaluateSoD(identity, policy));
          break;
        case 'ROLE_ELIGIBILITY':
          violations.push(...this.evaluateRoleEligibility(identity, state, policy));
          break;
      }
    }

    return { identityId: identity.id, violations };
  }

  private evaluateLeastPrivilege(
    identity: Identity,
    state: IdentityMonitoringState,
    policy: Policy
  ): PolicyViolation[] {
    // Heuristic: if identity has roles spanning many high-risk domains compared to peers in same department.
    const domains = new Set<string>();
    for (const roleId of identity.roles) {
      const role = state.roles.get(roleId);
      if (!role) continue;
      role.domains.forEach((d) => domains.add(d));
    }

    const peers = Array.from(state.identities.values()).filter(
      (p) =>
        p.id !== identity.id &&
        p.attributes.department === identity.attributes.department &&
        p.attributes.seniority === identity.attributes.seniority
    );

    if (peers.length === 0) return [];

    const avgDomains =
      peers.reduce((sum, peer) => {
        const peerDomains = new Set<string>();
        for (const roleId of peer.roles) {
          const role = state.roles.get(roleId);
          if (!role) continue;
          role.domains.forEach((d) => peerDomains.add(d));
        }
        return sum + peerDomains.size;
      }, 0) / peers.length;

    const domainCount = domains.size;
    if (domainCount > avgDomains * 1.8 && domainCount >= 3) {
      return [
        {
          id: `${policy.id}-lp-${identity.id}`,
          policyId: policy.id,
          policyType: 'LEAST_PRIVILEGE',
          description:
            'Identity appears to have broader domain coverage than comparable peers, indicating potential excess privileges.',
          severity: domainCount >= 5 ? 'CRITICAL' : 'HIGH',
          details: {
            domainCount,
            peerAverageDomains: avgDomains,
            domains: Array.from(domains),
          },
        },
      ];
    }
    return [];
  }

  private evaluateSoD(identity: Identity, policy: Policy): PolicyViolation[] {
    const conflicts = (policy.config.conflictingRoles as string[][]) || [];
    const violations: PolicyViolation[] = [];
    for (const pair of conflicts) {
      const [a, b] = pair;
      if (identity.roles.includes(a) && identity.roles.includes(b)) {
        violations.push({
          id: `${policy.id}-sod-${identity.id}-${a}-${b}`,
          policyId: policy.id,
          policyType: 'SOD',
          description: 'Identity holds a conflicting combination of roles violating Segregation of Duties.',
          severity: 'CRITICAL',
          details: { roles: [a, b] },
        });
      }
    }
    return violations;
  }

  private evaluateRoleEligibility(
    identity: Identity,
    state: IdentityMonitoringState,
    policy: Policy
  ): PolicyViolation[] {
    const rules = (policy.config.rules as Array<{
      roleId: string;
      minSeniority?: Identity['attributes']['seniority'];
      allowedEmploymentTypes?: Identity['attributes']['employmentType'][];
      allowedDepartments?: string[];
    }>) || [];

    const violations: PolicyViolation[] = [];

    for (const rule of rules) {
      if (!identity.roles.includes(rule.roleId)) continue;
      const role = state.roles.get(rule.roleId) as Role | undefined;
      const issues: string[] = [];

      if (rule.minSeniority) {
        const order: Identity['attributes']['seniority'][] = [
          'INTERN',
          'JUNIOR',
          'MID',
          'SENIOR',
          'EXECUTIVE',
        ];
        const currentIdx = order.indexOf(identity.attributes.seniority);
        const requiredIdx = order.indexOf(rule.minSeniority);
        if (currentIdx < requiredIdx) {
          issues.push(
            `requires at least ${rule.minSeniority} but identity is ${identity.attributes.seniority}`
          );
        }
      }

      if (rule.allowedEmploymentTypes) {
        if (!rule.allowedEmploymentTypes.includes(identity.attributes.employmentType)) {
          issues.push(
            `employment type ${identity.attributes.employmentType} not eligible (allowed: ${rule.allowedEmploymentTypes.join(
              ', '
            )})`
          );
        }
      }

      if (rule.allowedDepartments) {
        if (!rule.allowedDepartments.includes(identity.attributes.department)) {
          issues.push(
            `department ${identity.attributes.department} not eligible (allowed: ${rule.allowedDepartments.join(
              ', '
            )})`
          );
        }
      }

      if (issues.length > 0) {
        violations.push({
          id: `${policy.id}-elig-${identity.id}-${rule.roleId}`,
          policyId: policy.id,
          policyType: 'ROLE_ELIGIBILITY',
          description: `Identity does not meet eligibility requirements for role ${rule.roleId}: ${issues.join(
            '; '
          )}`,
          severity: role?.sensitivity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          details: {
            roleId: rule.roleId,
            issues,
          },
        });
      }
    }
    return violations;
  }
}

