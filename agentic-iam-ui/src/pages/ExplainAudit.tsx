import React, { useEffect, useState } from 'react';
import { fetchIdentities, IdentityViewModel } from '../services/iamApi';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { RemediationActions } from '../components/RemediationActions';
import { DecisionFlow } from '../components/DecisionFlow';
import { RiskBadge } from '../components/RiskBadge';
import { Avatar, PageHeader, Skeleton, riskTier } from '../components/ui';
import { FileSearch } from 'lucide-react';

export const ExplainAudit: React.FC = () => {
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const load = () => fetchIdentities().then(ids => {
    const sorted = [...ids].sort((a, b) => b.risk.riskScore - a.risk.riskScore);
    setIdentities(sorted);
    setSelectedId(cur => cur && sorted.some(x => x.identity.id === cur) ? cur : sorted[0]?.identity.id);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const selected = identities.find(vm => vm.identity.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
      <div className="animate-rise">
        <PageHeader
          eyebrow="Workspace"
          title="Audit & decisions"
          description="Every decision keeps its evidence: the risk factors, the policy checks, the model's rationale, and what an operator did next."
          icon={<FileSearch className="h-5 w-5" />}
        />

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <nav aria-label="Identities" className="min-w-0 lg:sticky lg:top-6">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Decisions · by risk</div>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : (
              <ul className="scroll-quiet -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:block lg:max-h-[calc(100vh-200px)] lg:space-y-1.5 lg:overflow-y-auto lg:px-0">
                {identities.map(vm => {
                  const active = vm.identity.id === selectedId;
                  return (
                    <li key={vm.identity.id} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => setSelectedId(vm.identity.id)}
                        className={`flex w-[260px] items-center gap-3 rounded-xl border px-3 lg:w-full py-2.5 text-left transition ${active ? 'border-white/15 bg-white/[0.06]' : 'border-transparent hover:bg-white/[0.03]'}`}
                      >
                        <Avatar name={vm.identity.name} tier={riskTier(vm.risk.riskScore, vm.anomaly)} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-white">{vm.identity.name}</span>
                          <span className="block truncate text-[11px] text-white/50">{vm.identity.attributes.title}</span>
                        </span>
                        <RiskBadge score={vm.risk.riskScore} anomaly={vm.anomaly} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="grid min-w-0 gap-4">
            {selected && <DecisionFlow risk={selected.risk} policy={selected.policy} decision={selected.decision.outcome} subjectName={selected.identity.name} />}
            <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
              <ExplainabilityPanel viewModel={selected} />
              <RemediationActions viewModel={selected} onActionCompleted={load} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
