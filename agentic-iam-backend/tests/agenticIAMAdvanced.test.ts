import { IAMOrchestrator } from '../src/orchestrator/IAMController';
import { Policy } from '../src/models/Policy';

delete process.env.ANTHROPIC_API_KEY;
delete process.env.GEMINI_API_KEY;
delete process.env.OPENAI_API_KEY;

describe('Agentic IAM Advanced Features & Governance', () => {
  let orchestrator: IAMOrchestrator;

  beforeEach(() => {
    orchestrator = new IAMOrchestrator();
  });

  describe('AI Agent Governance & Unowned Identity Policies', () => {
    it('detects unowned AI agent holding critical root privileges and flags critical violation', async () => {
      const vm = await orchestrator.evaluateIdentity('id-crawler-agent');
      expect(vm).not.toBeNull();
      expect(vm!.identity.attributes.identityType).toBe('AI_AGENT');
      expect(vm!.identity.attributes.owner).toBe('');

      // Must have AI_AGENT_GOVERNANCE violation
      const unownedViolation = vm!.policy.violations.find((v: any) => v.policyType === 'AI_AGENT_GOVERNANCE');
      expect(unownedViolation).toBeDefined();
      expect(unownedViolation.severity).toBe('CRITICAL');

      // AI governance risk factor should be high
      expect(vm!.risk.factors.agentGovernanceScore).toBeGreaterThanOrEqual(60);
      expect(['RECOMMEND_REVOCATION', 'AUTO_REMEDIATE']).toContain(vm!.decision.outcome);
    });

    it('clears unowned violation when accountable human owner is assigned', async () => {
      const state = (orchestrator as any).identityAgent.getSnapshot();
      const crawler = state.identities.get('id-crawler-agent');
      crawler.attributes.owner = 'Rohan';

      // Still has critical role violation if not allowed, but unowned violation is gone
      const vm = await orchestrator.evaluateIdentity('id-crawler-agent');
      const unowned = vm!.policy.violations.find((v: any) => v.id.includes('unowned'));
      expect(unowned).toBeUndefined();
    });
  });

  describe('Pre-flight What-If Access Request Simulator', () => {
    it('accurately projects risk delta and policy conflicts before granting a role', async () => {
      // Simulate intern requesting Production DB Admin
      const sim = await orchestrator.simulateAccessRequest('id-om', 'role-prod-db-admin', 'Need to debug production issue');
      expect(sim).not.toBeNull();
      expect(sim!.identityName).toBe('Om');
      expect(sim!.requestedRole.id).toBe('role-prod-db-admin');
      expect(sim!.baseline.riskScore).toBeLessThan(sim!.projected.riskScore);
      expect(sim!.projected.riskDelta).toBeGreaterThan(30);

      // Should detect that this creates new policy violations
      expect(sim!.projected.newViolations.length).toBeGreaterThan(0);
      expect(sim!.projected.newViolations.some((v: any) => v.policyType === 'ROLE_ELIGIBILITY')).toBe(true);

      // Recommendation should reject due to policy conflict
      expect(sim!.recommendation).toBe('REJECT_POLICY_CONFLICT');

      // Crucially, verify that the real identity was NOT modified
      const realIdentity = orchestrator.getIdentity('id-om');
      expect(realIdentity!.roles).not.toContain('role-prod-db-admin');
    });

    it('approves compliant access request with low risk delta', async () => {
      // Junior engineer requesting software engineer role (which they might already have or dev access)
      const sim = await orchestrator.simulateAccessRequest('id-5', 'role-software-engineer');
      expect(sim).not.toBeNull();
      expect(sim!.recommendation).toBe('SAFE_TO_GRANT');
    });
  });

  describe('Dynamic Policy Management CRUD', () => {
    it('lists seeded policies including AI Agent Governance and Toxic Combinations', () => {
      const policies = orchestrator.getPolicies();
      expect(policies.length).toBeGreaterThanOrEqual(4);
      expect(policies.some((p) => p.type === 'AI_AGENT_GOVERNANCE')).toBe(true);
      expect(policies.some((p) => p.type === 'TOXIC_COMBINATION')).toBe(true);
    });

    it('adds, updates, toggles, and removes policies dynamically', async () => {
      const customPolicy: Policy = {
        id: 'policy-test-custom',
        name: 'Custom Test Restriction',
        type: 'ROLE_ELIGIBILITY',
        description: 'Blocks intern engineer role',
        enabled: true,
        config: {
          rules: [{ roleId: 'role-intern-engineer', minSeniority: 'SENIOR' }],
        },
      };

      orchestrator.addPolicy(customPolicy);
      expect(orchestrator.getPolicy('policy-test-custom')).toBeDefined();

      // Should trigger on id-om now
      let vm = await orchestrator.evaluateIdentity('id-om');
      expect(vm!.policy.violations.some((v: any) => v.policyId === 'policy-test-custom')).toBe(true);

      // Disable policy
      orchestrator.updatePolicy('policy-test-custom', { enabled: false });
      vm = await orchestrator.evaluateIdentity('id-om');
      expect(vm!.policy.violations.some((v: any) => v.policyId === 'policy-test-custom')).toBe(false);

      // Remove policy
      const removed = orchestrator.removePolicy('policy-test-custom');
      expect(removed).toBe(true);
      expect(orchestrator.getPolicy('policy-test-custom')).toBeUndefined();
    });
  });

  describe('Quarantine & Targeted Remediation', () => {
    it('quarantines an identity by revoking all privileges and logging emergency action', async () => {
      const action = orchestrator.quarantineIdentity('id-kabir', 'Detected anomalous privilege escalation');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('QUARANTINE_IDENTITY');

      const kabir = orchestrator.getIdentity('id-kabir');
      expect(kabir!.roles).toHaveLength(0);

      const log = orchestrator.getRemediationLog();
      expect(log.some((l) => l.type === 'QUARANTINE_IDENTITY' && l.identityId === 'id-kabir')).toBe(true);
    });

    it('supports targeted revocation of a specific role', async () => {
      const action = orchestrator.revokeRole('id-nikhil', 'role-finance-approver', 'SoD resolution');
      expect(action).not.toBeNull();
      expect(action!.type).toBe('REVOKE_ACCESS');

      const nikhil = orchestrator.getIdentity('id-nikhil');
      expect(nikhil!.roles).toContain('role-finance-analyst');
      expect(nikhil!.roles).not.toContain('role-finance-approver');
    });
  });

  describe('Audit Log Export', () => {
    it('exports audit log in both JSON and CSV formats', async () => {
      // Evaluate an identity to ensure audit log has records
      await orchestrator.evaluateIdentity('id-om');

      const jsonExport = await orchestrator.exportAuditLog('json');
      expect(Array.isArray(jsonExport)).toBe(true);
      expect(jsonExport.length).toBeGreaterThan(0);

      const csvExport = await orchestrator.exportAuditLog('csv');
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain('id,timestamp,isoTime,identityId,outcome');
      expect(csvExport).toContain('id-om');
    });
  });
});
