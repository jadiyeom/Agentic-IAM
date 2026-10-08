import React from 'react';
import { IdentityViewModel } from '../services/iamApi';
import { FileText, ShieldAlert, ShieldCheck, Gauge } from 'lucide-react';
import { Card, CardHeader, EmptyState, Meter, humanize, providerLabel, riskTier, tierStyles } from './ui';

interface Props {
  viewModel: IdentityViewModel | null;
}

const factorLabels: Record<string, string> = {
  roleSensitivityScore: 'Role sensitivity',
  seniorityAlignmentScore: 'Seniority alignment',
  peerAnomalyScore: 'Peer anomaly',
  historicalChangeScore: 'Historical change',
};

const severityCls: Record<string, string> = {
  CRITICAL: 'border-red-400/30 bg-red-400/[0.08] text-red-200',
  HIGH: 'border-orange-400/25 bg-orange-400/[0.07] text-orange-200',
  MEDIUM: 'border-amber-300/25 bg-amber-300/[0.06] text-amber-200',
  LOW: 'border-white/10 bg-white/[0.04] text-white/70',
};

export const RiskFactors: React.FC<{ viewModel: IdentityViewModel }> = ({ viewModel }) => {
  const tier = riskTier(viewModel.risk.riskScore, viewModel.anomaly);
  return (
    <div className="space-y-3.5">
      {Object.entries(viewModel.risk.factors).map(([key, value]) => (
        <div key={key}>
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="text-white/65">{factorLabels[key] ?? humanize(key)}</span>
            <span className="tabular-nums text-white/50">{Number(value).toFixed(0)}</span>
          </div>
          <Meter value={Number(value)} max={100} barClassName={Number(value) > 0 ? tierStyles[tier].bar : 'bg-white/20'} label={factorLabels[key] ?? key} />
        </div>
      ))}
    </div>
  );
};

export const PolicyViolations: React.FC<{ viewModel: IdentityViewModel }> = ({ viewModel }) => {
  const { violations } = viewModel.policy;
  if (violations.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <div>
          <div className="text-[13px] font-medium text-emerald-100">No policy violations</div>
          <p className="mt-0.5 text-[12px] leading-5 text-white/55">Least-privilege, separation-of-duties and eligibility checks all passed.</p>
        </div>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {violations.map(v => (
        <li key={v.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/55">{v.policyType.replace(/_/g, ' ')}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${severityCls[v.severity] ?? severityCls.LOW}`}>{v.severity.toLowerCase()}</span>
          </div>
          <p className="mt-1.5 text-[12px] leading-5 text-white/75">{v.description}</p>
        </li>
      ))}
    </ul>
  );
};

export const ExplainabilityPanel: React.FC<Props> = ({ viewModel }) => {
  if (!viewModel) {
    return (
      <Card>
        <EmptyState icon={<FileText className="h-4 w-4" />} title="Nothing selected" text="Select an identity to inspect agent reasoning, policy checks and the audit narrative." />
      </Card>
    );
  }

  const { audit, risk } = viewModel;
  const tier = riskTier(risk.riskScore, viewModel.anomaly);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader
          icon={<Gauge className="h-4 w-4" />}
          title="Risk composition"
          subtitle="How RiskAgent arrived at the composite score."
          action={<span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums ${tierStyles[tier].chip}`}>{risk.riskScore} · {tierStyles[tier].label}</span>}
        />
        <div className="p-5"><RiskFactors viewModel={viewModel} /></div>
      </Card>

      <Card>
        <CardHeader icon={<ShieldAlert className="h-4 w-4" />} title="Policy evaluation" subtitle={`${viewModel.policy.violations.length} violation${viewModel.policy.violations.length === 1 ? '' : 's'} found by PolicyAgent.`} />
        <div className="p-5"><PolicyViolations viewModel={viewModel} /></div>
      </Card>

      <Card>
        <CardHeader
          icon={<FileText className="h-4 w-4" />}
          title="Decision narrative"
          subtitle={`${providerLabel(audit.decision.decisionProvider)} · ${Math.round(audit.decision.confidence * 100)}% confidence`}
          action={<time className="whitespace-nowrap rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-white/50" dateTime={new Date(audit.timestamp).toISOString()}>{new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>}
        />
        <div className="space-y-4 p-5">
          <blockquote className="border-l-2 border-[#b7ff49]/50 pl-4 text-[13px] leading-6 text-white/80">{audit.decision.rationale}</blockquote>
          <p className="text-[12px] leading-6 text-white/55">{audit.explanation}</p>
        </div>
      </Card>
    </div>
  );
};
