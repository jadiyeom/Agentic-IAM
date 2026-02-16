import { IdentityMonitoringAgent } from '../agents/IdentityAgent';
import { RiskEvaluationAgent, RiskEvaluationResult } from '../agents/RiskAgent';
import { PolicyComplianceAgent, PolicyEvaluationResult } from '../agents/PolicyAgent';
import { DecisionAgent, DecisionResult } from '../agents/DecisionAgent';
import { RemediationAgent, RemediationAction } from '../agents/RemediationAgent';
import { AuditExplainabilityAgent, AuditRecord } from '../agents/AuditAgent';
import { Identity } from '../models/Identity';
import { Role } from '../models/Role';
import { Entitlement } from '../models/Entitlement';
import { v4 as uuidv4 } from 'uuid';

type IdentityViewModel = {
  identity: Identity;
  risk: any;
  policy: any;
  decision: any;
  audit: any;
  anomaly: boolean;
  remediationStatus?: {
    type: string;
    timestamp: number;
    details?: Record<string, unknown>;
  };
};

type IAMMetrics = {
  totalDecisions: number;
  cumulativeDecisionTimeMs: number;
  anomaliesDetected: number;
  policyViolationsDetected: number;
  decisionsOverridden: number;
};

class IAMOrchestrator {
    removeIdentity(identityId: string): boolean {
      return this.identityAgent.removeIdentity(identityId);
    }

    assignRoleToIdentity(identityId: string, roleId: string): Identity | null {
      const state = this.identityAgent.getSnapshot();
      const identity = state.identities.get(identityId);
      if (!identity) return null;
      this.identityAgent.assignRole(identityId, roleId);
      // Remove all remediation actions for this identity so it reappears in Explainability & Audit
      const remAgent = this.remediationAgent as any;
      if (remAgent && Array.isArray(remAgent.auditLog)) {
        remAgent.auditLog = remAgent.auditLog.filter((a: any) => a.identityId !== identityId);
      }
      return this.identityAgent.getSnapshot().identities.get(identityId) ?? null;
    }
  private identityAgent: IdentityMonitoringAgent;
  private riskAgent: RiskEvaluationAgent;
  private policyAgent: PolicyComplianceAgent;
  private decisionAgent: DecisionAgent;
  private remediationAgent: RemediationAgent;
  private auditAgent: AuditExplainabilityAgent;
  private metrics: IAMMetrics;

  constructor() {
    const { seedIdentities, seedRoles, seedEntitlements } = require('../seed');
    const identities = seedIdentities();
    const roles = seedRoles();
    const entitlements = seedEntitlements();
    this.identityAgent = new IdentityMonitoringAgent({
      identities: new Map(identities.map((i: Identity) => [i.id, i])),
      roles: new Map(roles.map((r: Role) => [r.id, r])),
      entitlements: new Map(entitlements.map((e: Entitlement) => [e.id, e])),
    });
    this.riskAgent = new RiskEvaluationAgent();
    // Debug log: print all seeded identity names
    // eslint-disable-next-line no-console
    console.log('Seeded identities:', identities.map((i: Identity) => i.name));
    // Pass seeded policies to PolicyComplianceAgent
    const { seedPolicies } = require('../seed');
    this.policyAgent = new PolicyComplianceAgent(seedPolicies());
    this.decisionAgent = new DecisionAgent();
    // Pass identityAgent to RemediationAgent
    this.remediationAgent = new RemediationAgent(this.identityAgent);
    this.auditAgent = new AuditExplainabilityAgent();
    this.metrics = {
      totalDecisions: 0,
      cumulativeDecisionTimeMs: 0,
      anomaliesDetected: 0,
      policyViolationsDetected: 0,
      decisionsOverridden: 0,
    };
  }

  async evaluateIdentity(identityId: string): Promise<IdentityViewModel | null> {
    const state = this.identityAgent.getSnapshot();
    const identity = state.identities.get(identityId);
    if (!identity) return null;

    const start = Date.now();

    const risk = this.riskAgent.evaluateIdentity(identity, state);
    const policy = this.policyAgent.evaluate(identity, state);
    const decision = await this.decisionAgent.decide({ identity, risk, policy });

    const anomaly =
      risk.riskScore >= 70 || policy.violations.some((v: any) => v.severity === 'HIGH' || v.severity === 'CRITICAL');

    if (anomaly) {
      this.metrics.anomaliesDetected += 1;
    }
    this.metrics.policyViolationsDetected += policy.violations.length;

    const audit = await this.auditAgent.createRecord(identity, decision, risk, policy);

    // Find latest remediation action for this identity
    let remediationStatus = undefined;
    const remLog = this.remediationAgent.getActions();
    const lastAction = remLog.filter(a => a.identityId === identityId).sort((a, b) => b.timestamp - a.timestamp)[0];
    if (lastAction) {
      remediationStatus = {
        type: lastAction.type,
        timestamp: lastAction.timestamp,
        details: lastAction.details,
      };
    }

    const end = Date.now();
    this.metrics.totalDecisions += 1;
    this.metrics.cumulativeDecisionTimeMs += end - start;

    return {
      identity,
      risk,
      policy,
      decision,
      audit,
      anomaly,
      remediationStatus,
    };
  }

  async evaluateAllIdentities(): Promise<IdentityViewModel[]> {
    const state = this.identityAgent.getSnapshot();
    const ids = Array.from(state.identities.keys());
    const results: IdentityViewModel[] = [];

    for (const id of ids) {
      const res = await this.evaluateIdentity(id);
      if (res) results.push(res);
    }
    return results;
  }




  getMetrics(): IAMMetrics {
    return { ...this.metrics };
  }

  getAuditLog(): AuditRecord[] {
    return this.auditAgent.getRecords();
  }

  getRemediationLog(): RemediationAction[] {
    return this.remediationAgent.getActions();
  }

  async simulateAbnormalRole(identityId: string, roleId: string): Promise<IdentityViewModel | null> {
    const state = this.identityAgent.getSnapshot();
    if (!state.identities.get(identityId)) return null;
    this.identityAgent.assignRole(identityId, roleId);
    this.identityAgent.recordSnapshot(identityId, {
      roles: state.identities.get(identityId)?.roles ?? [],
      entitlements: state.identities.get(identityId)?.entitlements ?? [],
      riskScore: 0,
      status: 'NORMAL',
    });
    return this.evaluateIdentity(identityId);
  }

  autoRemediate(identityId: string, outcome: DecisionResult['outcome']): RemediationAction | null {
    return this.remediationAgent.autoRemediate(identityId, outcome);
  }

  overrideDecision(identityId: string, previousOutcome: DecisionResult['outcome'], reason: string): RemediationAction {
    this.metrics.decisionsOverridden += 1;
    return this.remediationAgent.recordIgnored(identityId, previousOutcome, reason);
  }

  getIdentity(identityId: string): Identity | null {
    const state = this.identityAgent.getSnapshot();
    return state.identities.get(identityId) ?? null;
  }

  createIdentity(identity: Omit<Identity, 'id' | 'history'> & { id?: string }): Identity {
    const fullIdentity: Identity = {
      id: identity.id ?? uuidv4(),
      name: identity.name,
      attributes: identity.attributes,
      roles: identity.roles ?? [],
      entitlements: identity.entitlements ?? [],
      history: [],
    };
    this.identityAgent.upsertIdentity(fullIdentity);
    return fullIdentity;
  }

  // Audit timeline
  async getAuditTimeline() {
    // Return dummy timeline for now
    return [
      { time: '8:13 PM', label: 'Identity evaluated' },
      { time: '8:13 PM', label: 'Risk computed' },
      { time: '8:13 PM', label: 'Policy checked' },
      { time: '8:13 PM', label: 'Decision issued' },
    ];
  }

  // Audit export
  async exportAuditLog() {
    // Return all audit records
    return this.auditAgent.getRecords();
  }

  // Risk distribution
  async getRiskDistribution() {
    const all = await this.evaluateAllIdentities();
    return {
      low: all.filter(vm => vm.risk.riskScore >= 0 && vm.risk.riskScore <= 5).length,
      medium: all.filter(vm => vm.risk.riskScore >= 6 && vm.risk.riskScore <= 12).length,
      high: all.filter(vm => vm.risk.riskScore >= 13).length,
    };
  }

  // Decision volume
  async getDecisionVolume() {
    // Dummy: return decisions per day
    return [
      { day: 'Mon', count: 120 },
      { day: 'Tue', count: 140 },
      { day: 'Wed', count: 110 },
      { day: 'Thu', count: 130 },
      { day: 'Fri', count: 150 },
    ];
  }

  // Agent health
  async getAgentHealth() {
    return {
      status: 'Active',
      lastRun: '2m ago',
      policiesLoaded: this.policyAgent.getPolicyCount(),
      latency: 120,
    };
  }

  // Identity context
  async getIdentityContext(id: string) {
    const vm = await this.evaluateIdentity(id);
    if (!vm) return null;
    // Dummy context
    return {
      lastLogin: '2026-02-07T20:13:00Z',
      manager: 'Alex Manager',
      accessHistory: [
        { time: '2026-02-07T19:00:00Z', action: 'Login' },
        { time: '2026-02-07T18:00:00Z', action: 'Role change' },
      ],
      riskTrend: [5, 7, 12, 16],
      pastDecisions: [
        { time: '2026-02-07T20:13:00Z', outcome: vm.decision.outcome },
      ],
    };
  }

}

export { IAMOrchestrator };

