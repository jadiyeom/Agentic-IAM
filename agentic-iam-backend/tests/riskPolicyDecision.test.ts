import { IAMOrchestrator } from '../src/orchestrator/IAMController';
import { DecisionAgent } from '../src/agents/DecisionAgent';
import { riskTier } from '../src/riskTiers';

// Force the deterministic decision path so tests never call a model.
delete process.env.ANTHROPIC_API_KEY;

describe('Steerpast IAM pipeline', () => {
  let orchestrator: IAMOrchestrator;
  beforeEach(() => {
    orchestrator = new IAMOrchestrator();
  });

  it('approves a baseline intern with only dev access', async () => {
    const vm = await orchestrator.evaluateIdentity('id-om');
    expect(vm).not.toBeNull();
    expect(riskTier(vm!.risk.riskScore)).toBe('LOW');
    expect(vm!.policy.violations).toHaveLength(0);
    expect(vm!.anomaly).toBe(false);
    expect(vm!.decision.outcome).toBe('APPROVE');
  });

  it('flags the seeded intern holding production DB admin', async () => {
    const vm = await orchestrator.evaluateIdentity('id-kabir');
    expect(vm).not.toBeNull();
    expect(riskTier(vm!.risk.riskScore)).toBe('HIGH');
    expect(vm!.policy.violations.some((v: any) => v.policyType === 'ROLE_ELIGIBILITY' && v.severity === 'CRITICAL')).toBe(true);
    expect(vm!.anomaly).toBe(true);
    expect(vm!.decision.outcome).toBe('RECOMMEND_REVOCATION');
  });

  it('detects a separation-of-duties conflict', async () => {
    const vm = await orchestrator.evaluateIdentity('id-nikhil');
    expect(vm!.policy.violations.some((v: any) => v.policyType === 'SOD')).toBe(true);
    expect(vm!.decision.outcome).toBe('RECOMMEND_REVOCATION');
  });

  it('sends an AI agent with critical access to review, and approves a well-scoped one', async () => {
    const release = await orchestrator.evaluateIdentity('id-release-agent');
    expect(release!.decision.outcome).toBe('FLAG_FOR_REVIEW');
    const support = await orchestrator.evaluateIdentity('id-support-agent');
    expect(support!.decision.outcome).toBe('APPROVE');
  });

  it('escalates when an intern is granted an ineligible role at runtime', async () => {
    const vm = await orchestrator.simulateAbnormalRole('id-om', 'role-prod-db-admin');
    expect(vm!.policy.violations.some((v: any) => v.policyType === 'ROLE_ELIGIBILITY')).toBe(true);
    expect(['RECOMMEND_REVOCATION', 'AUTO_REMEDIATE']).toContain(vm!.decision.outcome);
  });

  it('revocation removes exactly the role the policy objected to', async () => {
    const action = orchestrator.autoRemediate('id-kabir', 'AUTO_REMEDIATE');
    expect(action!.details.revokedRoles).toEqual(['role-prod-db-admin']);
    const vm = await orchestrator.evaluateIdentity('id-kabir');
    expect(vm!.identity.roles).toEqual(['role-intern-engineer']);
    expect(vm!.policy.violations).toHaveLength(0);
  });

  it('reset restores the seeded dataset', async () => {
    orchestrator.removeIdentity('id-om');
    expect(orchestrator.getIdentity('id-om')).toBeNull();
    orchestrator.reset();
    expect(orchestrator.getIdentity('id-om')).not.toBeNull();
  });
});

describe('DecisionAgent output validation', () => {
  const agent = new DecisionAgent();

  it('accepts a well-formed model response and clamps confidence', () => {
    const r = agent.parseDecisionResponse('Sure: {"outcome":"flag_for_review","rationale":"Needs a look.","confidence":1.7}');
    expect(r).toEqual({ outcome: 'FLAG_FOR_REVIEW', rationale: 'Needs a look.', confidence: 1 });
  });

  it.each([
    ['{"outcome":"DELETE_EVERYTHING","rationale":"x","confidence":0.5}'],
    ['{"outcome":"APPROVE","rationale":"  ","confidence":0.5}'],
    ['{"outcome":"APPROVE","rationale":"ok","confidence":"high"}'],
    ['not json at all'],
  ])('rejects malformed output: %s', (text) => {
    expect(() => agent.parseDecisionResponse(text)).toThrow();
  });
});
