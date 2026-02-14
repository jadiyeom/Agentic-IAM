import React, { useEffect, useState } from 'react';
import { fetchIdentities, fetchMetrics, IdentityViewModel, Metrics, simulateAnomaly, fetchRoles, Role } from '../services/iamApi';
import { IdentityTable } from '../components/IdentityTable';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { DecisionFlow } from '../components/DecisionFlow';
import { RemediationActions } from '../components/RemediationActions';
import { AlertTriangle, Gauge, RefreshCcw } from 'lucide-react';
export const Dashboard: React.FC = () => {
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [ids, m] = await Promise.all([fetchIdentities(), fetchMetrics()]);
      setIdentities(ids);
      setMetrics(m);
      if (!selectedId && ids.length > 0) {
        setSelectedId(ids[0].identity.id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    fetchRoles().then(setRoles);
  }, []);

  const selected = identities.find((vm) => vm.identity.id === selectedId) ?? null;

  async function simulateInternProdAdmin() {
    if (!identities.length) return;
    const intern = identities.find((vm) => vm.identity.id === 'id-intern-1') ?? identities[0];
    setSimulating(true);
    try {
      const updated = await simulateAnomaly(intern.identity.id, 'role-prod-db-admin');
      const next = identities.map((vm) => (vm.identity.id === updated.identity.id ? updated : vm));
      setIdentities(next);
      setSelectedId(updated.identity.id);
      const m = await fetchMetrics();
      setMetrics(m);
    } finally {
      setSimulating(false);
    }
  }

  const meanDecisionTimeMs =
    metrics && metrics.totalDecisions > 0
      ? Math.round(metrics.cumulativeDecisionTimeMs / metrics.totalDecisions)
      : 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Agentic IAM Control Plane</h1>
          <p className="text-xs text-slate-400">
            Autonomous agents continuously evaluate identities for risk, policy violations, and remediation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={simulateInternProdAdmin}
            disabled={simulating}
            className="inline-flex items-center gap-1 rounded-lg border border-danger bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20 disabled:opacity-60"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Simulate Intern → Prod DB Admin
          </button>
        </div>
      </header>

      <section className="grid grid-cols-[2.1fr,1.6fr] gap-4">
        <IdentityTable identities={identities} selectedId={selectedId} onSelect={setSelectedId} roles={roles} />

        <div className="flex flex-col gap-3">
          <DecisionFlow
            risk={selected?.risk ?? null}
            policy={selected?.policy ?? null}
            decision={selected?.decision.outcome ?? null}
          />
          <RemediationActions viewModel={selected} onActionCompleted={loadData} />
        </div>
      </section>

      <section className="grid grid-cols-[2.2fr,1.4fr] gap-4 pb-4">
        <ExplainabilityPanel viewModel={selected} />

        <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-surfaceAlt/90 p-4 shadow-lg">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-slate-50">System Metrics</h3>
            </div>
            <div className="text-[10px] text-slate-500">Research instrumentation</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Anomaly Detection</div>
              <div className="mt-1 text-lg font-semibold text-slate-50">
                {metrics?.anomaliesDetected ?? 0}
                <span className="ml-1 text-[11px] text-slate-500">anomalies</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                Policy violations detected: {metrics?.policyViolationsDetected ?? 0}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Decision Quality</div>
              <div className="mt-1 text-lg font-semibold text-slate-50">
                {meanDecisionTimeMs}
                <span className="ml-1 text-[11px] text-slate-500">ms mean decision time</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                Overrides: {metrics?.decisionsOverridden ?? 0} / {metrics?.totalDecisions ?? 0} decisions
              </div>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            These metrics support research on anomaly detection accuracy, false positives, and operator trust
            in automated IAM decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

