import React, { useState } from 'react';
import { DecisionOutcome, IdentityViewModel, performRemediationAction } from '../services/iamApi';
import { Ban, ClipboardList, ThumbsUp } from 'lucide-react';

interface Props {
  viewModel: IdentityViewModel | null;
  onActionCompleted?: () => void;
}

export const RemediationActions: React.FC<Props> = ({ viewModel, onActionCompleted }) => {
  const [loading, setLoading] = useState<DecisionOutcome | 'IGNORE' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700/80 bg-surfaceAlt/60 p-4 text-xs text-slate-500">
        Select an identity to trigger remediation actions against the current decision.
      </div>
    );
  }

  const decision = viewModel.decision;

  async function trigger(action: 'REVOKE_ACCESS' | 'SEND_FOR_REVIEW' | 'IGNORE') {
    try {
      setLoading(action === 'IGNORE' ? 'IGNORE' : decision.outcome);
      setError(null);
      await performRemediationAction({
        identityId: viewModel.identity.id,
        action,
        decisionOutcome: decision.outcome,
        reason: action === 'IGNORE' ? reason || 'Explicit human override' : undefined,
      });
      if (onActionCompleted) onActionCompleted();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError('Failed to apply remediation; see console for details.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-surfaceAlt/90 p-4 shadow-lg">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">Remediation Controls</h3>
          <p className="text-xs text-slate-400">
            Execute or override the agent&apos;s recommendation for this identity.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => trigger('REVOKE_ACCESS')}
          disabled={loading !== null}
          className="flex flex-col items-center gap-1 rounded-lg border border-danger/70 bg-danger/15 px-2 py-2 text-[11px] font-medium text-danger hover:bg-danger/25 disabled:opacity-60"
        >
          <Ban className="h-4 w-4" />
          Revoke Access
        </button>
        <button
          type="button"
          onClick={() => trigger('SEND_FOR_REVIEW')}
          disabled={loading !== null}
          className="flex flex-col items-center gap-1 rounded-lg border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25 disabled:opacity-60"
        >
          <ClipboardList className="h-4 w-4" />
          Send for Review
        </button>
        <button
          type="button"
          onClick={() => trigger('IGNORE')}
          disabled={loading !== null}
          className="flex flex-col items-center gap-1 rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-2 py-2 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
        >
          <ThumbsUp className="h-4 w-4" />
          Ignore (Override)
        </button>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">
        Decision: <span className="font-semibold text-slate-100">{decision.outcome}</span> (
        {Math.round(decision.confidence * 100)}% confidence, LLM:{' '}
        {decision.usedLLM ? 'enabled' : 'heuristic only'}).
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Optional justification when overriding the decision. This is stored in the remediation log."
        className="mt-1 h-16 w-full rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />
      {error && <div className="text-[11px] text-danger">{error}</div>}
    </div>
  );
};

