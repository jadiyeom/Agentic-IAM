import React from 'react';
import { IdentityViewModel } from '../services/iamApi';
import { FileText, ShieldAlert } from 'lucide-react';

interface Props {
  viewModel: IdentityViewModel | null;
}

export const ExplainabilityPanel: React.FC<Props> = ({ viewModel }) => {
  if (!viewModel) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-surfaceAlt/60 p-4 text-xs text-slate-500">
        Select an identity to inspect agent reasoning, policy violations, and audit trail.
      </div>
    );
  }

  const { identity, audit, policy, risk } = viewModel;

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-700 bg-surfaceAlt/90 p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">Explainability & Audit</h3>
          <p className="text-xs text-slate-400">
            Why the system considered this identity risky and how the decision was made.
          </p>
        </div>
        <div className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] text-slate-400">
          {new Date(audit.timestamp).toLocaleTimeString()}
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-slate-100">
          <ShieldAlert className="h-3.5 w-3.5 text-danger" />
          Policy Violations ({policy.violations.length})
        </div>
        {policy.violations.length === 0 ? (
          <p className="text-[11px] text-emerald-300">No violations. Access profile appears compliant.</p>
        ) : (
          <ul className="space-y-1.5">
            {policy.violations.map((v) => (
              <li key={v.id} className="rounded border border-slate-700/70 bg-slate-950/60 px-2 py-1">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wide">
                  <span className="text-slate-300">{v.policyType}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      v.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300'
                        : v.severity === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-200'
                        : 'bg-yellow-500/10 text-yellow-200'
                    }`}
                  >
                    {v.severity}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-200">{v.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-slate-100">
          <FileText className="h-3.5 w-3.5 text-accent" />
          Natural-Language Explanation
        </div>
        <p className="mb-1 text-[11px] text-slate-300">{audit.explanation}</p>
        <p className="mt-2 text-[10px] text-slate-500">
          Identity {identity.name} ({identity.attributes.title}, {identity.attributes.department}) evaluated with risk{' '}
          {risk.riskScore}. Decision: {audit.decision.outcome} ({Math.round(audit.decision.confidence * 100)}%
          confidence).
        </p>
      </div>
    </div>
  );
};

