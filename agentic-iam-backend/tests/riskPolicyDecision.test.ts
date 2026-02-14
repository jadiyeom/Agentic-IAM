import { IAMOrchestrator } from '../src/orchestrator/IAMController';
import { seedEntitlements, seedIdentities, seedPolicies, seedRoles } from '../src/seed';

describe('Agentic IAM orchestration', () => {
  const orchestrator = new IAMOrchestrator({
    identities: seedIdentities(),
    roles: seedRoles(),
    entitlements: seedEntitlements(),
    policies: seedPolicies(),
  });

  it('evaluates baseline intern as relatively low risk', async () => {
    const vm = await orchestrator.evaluateIdentity('id-intern-1');
    expect(vm).not.toBeNull();
    if (!vm) return;

    // Baseline intern with only dev read access should not be extreme risk.
    expect(vm.risk.riskScore).toBeLessThan(70);
    expect(vm.policy.violations.length).toBe(0);
    expect(vm.anomaly).toBe(false);
  });

  it('detects anomaly when intern receives production DB admin role', async () => {
    const vm = await orchestrator.simulateAbnormalRole('id-intern-1', 'role-prod-db-admin');
    expect(vm).not.toBeNull();
    if (!vm) return;

    // Risk should increase significantly.
    expect(vm.risk.riskScore).toBeGreaterThanOrEqual(70);

    // Role eligibility policy should be violated for critical role.
    const eligViolations = vm.policy.violations.filter((v) => v.policyType === 'ROLE_ELIGIBILITY');
    expect(eligViolations.length).toBeGreaterThan(0);

    // System should flag anomaly and recommend strong action.
    expect(vm.anomaly).toBe(true);
    expect(['RECOMMEND_REVOCATION', 'AUTO_REMEDIATE']).toContain(vm.decision.outcome);
  });
});

