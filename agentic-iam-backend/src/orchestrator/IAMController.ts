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
import { RISK_TIERS, riskTier } from '../riskTiers';

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
  private identityAgent!: IdentityMonitoringAgent;
  private riskAgent!: RiskEvaluationAgent;
  private policyAgent!: PolicyComplianceAgent;
  private decisionAgent!: DecisionAgent;
  private remediationAgent!: RemediationAgent;
  private auditAgent!: AuditExplainabilityAgent;
  private metrics!: IAMMetrics;
  private startedAt = Date.now();
  private lastRunAt: number | null = null;
  private latestDecisions = new Map<string, { outcome: string; at: number; provider: string; latencyMs: number }>();

  constructor() {
    this.init();
  }

  /** Restore the seeded demo state. */
  reset() {
    this.init();
  }

  private init() {
    this.startedAt = Date.now();
    this.lastRunAt = null;
    this.latestDecisions = new Map();
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
      risk.riskScore >= RISK_TIERS.high || policy.violations.some((v: any) => v.severity === 'HIGH' || v.severity === 'CRITICAL');

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
    this.lastRunAt = end;
    this.latestDecisions.set(identityId, {
      outcome: decision.outcome,
      at: end,
      provider: decision.decisionProvider,
      latencyMs: end - start,
    });

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
    // Evaluate in parallel: model calls dominate latency, and each identity is independent.
    const results = await Promise.all(ids.map((id) => this.evaluateIdentity(id)));
    return results.filter((r): r is IdentityViewModel => r !== null);
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
    const state = this.identityAgent.getSnapshot();
    const identity = state.identities.get(identityId);
    if (!identity) return null;
    // Target the roles the policy engine actually objected to.
    const policy = this.policyAgent.evaluate(identity, state);
    const offending = new Set<string>();
    for (const v of policy.violations) {
      const d = v.details as Record<string, unknown>;
      if (v.policyType === 'ROLE_ELIGIBILITY' && typeof d.roleId === 'string') offending.add(d.roleId);
      if (v.policyType === 'SOD' && Array.isArray(d.roles) && typeof d.roles[1] === 'string') offending.add(d.roles[1]);
    }
    return this.remediationAgent.autoRemediate(identityId, outcome, Array.from(offending));
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

  // Audit timeline: the most recent pipeline run, reconstructed from the audit log.
  async getAuditTimeline() {
    const records = this.auditAgent.getRecords();
    const last = records[records.length - 1];
    if (!last) return [];
    const fmt = (t: number) => new Date(t).toISOString();
    const identity = this.getIdentity(last.identityId);
    const name = identity?.name ?? last.identityId;
    return [
      { time: fmt(last.timestamp), label: `IdentityAgent loaded context for ${name}` },
      { time: fmt(last.timestamp), label: `RiskAgent scored ${last.risk.riskScore}/100 (${riskTier(last.risk.riskScore).toLowerCase()})` },
      { time: fmt(last.timestamp), label: `PolicyAgent found ${last.policy.violations.length} violation(s)` },
      { time: fmt(last.timestamp), label: `DecisionAgent issued ${last.decision.outcome.replace(/_/g, ' ').toLowerCase()}` },
    ];
  }

  // Audit export
  async exportAuditLog() {
    return this.auditAgent.getRecords();
  }

  // Risk distribution, using the shared tier thresholds.
  async getRiskDistribution() {
    const all = await this.evaluateAllIdentities();
    const counts = { low: 0, medium: 0, high: 0 };
    for (const vm of all) counts[riskTier(vm.risk.riskScore).toLowerCase() as 'low' | 'medium' | 'high'] += 1;
    return counts;
  }

  // Current decision mix across identities (one latest decision per identity).
  async getDecisionVolume() {
    const labels: Record<string, string> = {
      APPROVE: 'Approve',
      FLAG_FOR_REVIEW: 'Review',
      RECOMMEND_REVOCATION: 'Revoke',
      AUTO_REMEDIATE: 'Auto-fix',
    };
    if (this.latestDecisions.size === 0) await this.evaluateAllIdentities();
    const counts: Record<string, number> = { APPROVE: 0, FLAG_FOR_REVIEW: 0, RECOMMEND_REVOCATION: 0, AUTO_REMEDIATE: 0 };
    for (const d of this.latestDecisions.values()) counts[d.outcome] = (counts[d.outcome] ?? 0) + 1;
    return Object.entries(counts).map(([outcome, count]) => ({ day: labels[outcome] ?? outcome, outcome, count }));
  }

  // Agent health, from real pipeline activity.
  async getAgentHealth() {
    const mean = this.metrics.totalDecisions > 0 ? this.metrics.cumulativeDecisionTimeMs / this.metrics.totalDecisions : 0;
    const ago = this.lastRunAt ? Math.max(0, Math.round((Date.now() - this.lastRunAt) / 1000)) : null;
    const lastRun = ago === null ? 'not yet' : ago < 60 ? `${ago}s ago` : `${Math.round(ago / 60)}m ago`;
    return {
      status: 'Active',
      lastRun,
      policiesLoaded: this.policyAgent.getPolicyCount(),
      latency: Math.round(mean * 100) / 100,
      decisionProvider: process.env.ANTHROPIC_API_KEY ? 'claude' : 'heuristic',
      model: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5' : null,
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
    };
  }

  // Identity context: history, owner, and past decisions from the audit trail.
  async getIdentityContext(id: string) {
    const vm = await this.evaluateIdentity(id);
    if (!vm) return null;
    const records = this.auditAgent.getRecords().filter((r) => r.identityId === id);
    return {
      owner: vm.identity.attributes.owner ?? null,
      identityType: vm.identity.attributes.identityType ?? 'HUMAN',
      accessHistory: vm.identity.history.map((h) => ({ time: new Date(h.timestamp).toISOString(), roles: h.roles, status: h.status })),
      riskTrend: records.slice(-12).map((r) => r.risk.riskScore),
      pastDecisions: records.slice(-5).map((r) => ({ time: new Date(r.timestamp).toISOString(), outcome: r.decision.outcome })),
      remediation: this.remediationAgent.getActions().filter((a) => a.identityId === id),
    };
  }

}

export { IAMOrchestrator };

