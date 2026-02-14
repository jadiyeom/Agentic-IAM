import React, { useEffect, useState } from 'react';
import { fetchMetrics, Metrics, fetchIdentities, IdentityViewModel } from '../services/iamApi';
import { DecisionFlow } from '../components/DecisionFlow';

export const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchMetrics().then(setMetrics);
    fetchIdentities().then((ids) => {
      setIdentities(ids);
      if (!selectedId && ids.length > 0) {
        setSelectedId(ids[0].identity.id);
      }
    });
  }, []);

  if (!metrics) {
    return <div className="p-4 text-slate-400">Loading system metrics...</div>;
  }

  const meanDecisionTimeMs =
    metrics.totalDecisions > 0
      ? Math.round(metrics.cumulativeDecisionTimeMs / metrics.totalDecisions)
      : 0;

  const selected = identities.find((vm) => vm.identity.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-xl flex flex-col gap-4 px-4 py-4">
      <h1 className="text-xl font-bold text-slate-100 mb-2">System Metrics</h1>
      <div className="rounded-xl border border-slate-700 bg-surfaceAlt/80 p-4 shadow-lg mb-2">
        <div className="flex flex-col gap-1 text-xs text-slate-200">
          <div>Agent Status: <span className="font-semibold text-emerald-400">Active</span></div>
          <div>Last Run: <span className="font-semibold">2m ago</span></div>
          <div>Policies Loaded: <span className="font-semibold">24</span></div>
          <div>Latency: <span className="font-semibold">120ms</span></div>
        </div>
      </div>
      {/* Alert Feed */}
      <div className="rounded-xl border border-slate-700 bg-surfaceAlt/80 p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">Alert Feed</h3>
        <ul className="text-xs text-slate-300">
          <li className="mb-1">• High-risk identity detected</li>
          <li className="mb-1">• Policy update applied</li>
          <li className="mb-1">• Override logged</li>
        </ul>
      </div>
      <DecisionFlow
        risk={selected?.risk ?? null}
        policy={selected?.policy ?? null}
        decision={selected?.decision?.outcome ?? null}
      />
    </div>
  );
};
