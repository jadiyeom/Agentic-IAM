import React, { useState } from 'react';
import { IdentityViewModel, performRemediationAction } from '../services/iamApi';
import { Ban, Check, ClipboardList, Loader2, ThumbsUp, Wrench } from 'lucide-react';
import { Card, CardHeader, EmptyState, OutcomeBadge, providerLabel } from './ui';

interface Props {
  viewModel: IdentityViewModel | null;
  onActionCompleted?: () => void;
  bare?: boolean;
}

type Action = 'REVOKE_ACCESS' | 'SEND_FOR_REVIEW' | 'IGNORE';

const actions: { id: Action; label: string; hint: string; Icon: React.ElementType; cls: string }[] = [
  { id: 'REVOKE_ACCESS', label: 'Revoke access', hint: 'Remove the risky entitlement', Icon: Ban, cls: 'border-red-400/25 text-red-200 hover:border-red-400/45 hover:bg-red-400/[0.08]' },
  { id: 'SEND_FOR_REVIEW', label: 'Send for review', hint: 'Route to an access reviewer', Icon: ClipboardList, cls: 'border-amber-300/25 text-amber-200 hover:border-amber-300/45 hover:bg-amber-300/[0.07]' },
  { id: 'IGNORE', label: 'Override', hint: 'Keep access, log the reason', Icon: ThumbsUp, cls: 'border-white/10 text-white/75 hover:border-white/25 hover:bg-white/[0.05]' },
];

export const RemediationActions: React.FC<Props> = ({ viewModel, onActionCompleted, bare = false }) => {
  const [loading, setLoading] = useState<Action | null>(null);
  const [done, setDone] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (!viewModel) {
    return (
      <Card>
        <EmptyState icon={<Wrench className="h-4 w-4" />} title="No identity selected" text="Select an identity to act on its current decision." />
      </Card>
    );
  }

  const decision = viewModel.decision;

  async function trigger(action: Action) {
    try {
      setLoading(action);
      setDone(null);
      setError(null);
      await performRemediationAction({
        identityId: viewModel!.identity.id,
        action,
        decisionOutcome: decision.outcome,
        reason: action === 'IGNORE' ? reason || 'Explicit human override' : undefined,
      });
      setDone(action);
      onActionCompleted?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError('The action could not be applied. Nothing was changed.');
    } finally {
      setLoading(null);
    }
  }

  const body = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/55">
        Current decision <OutcomeBadge outcome={decision.outcome} />
        <span className="text-white/40">· {Math.round(decision.confidence * 100)}% · {providerLabel(decision.decisionProvider)}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {actions.map(({ id, label, hint, Icon, cls }) => (
          <button
            key={id}
            type="button"
            onClick={() => trigger(id)}
            disabled={loading !== null}
            className={`group flex flex-col items-start gap-2 rounded-xl border bg-white/[0.015] p-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
          >
            <span className="flex w-full items-center justify-between">
              {loading === id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : done === id ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
            </span>
            <span className="text-[13px] font-medium">{label}</span>
            <span className="text-[11px] leading-4 text-white/45">{hint}</span>
          </button>
        ))}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium text-white/55">Override justification <span className="text-white/35">(stored in the remediation log)</span></span>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={2}
          placeholder="Why should this access stay in place?"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[12px] text-white outline-none transition placeholder:text-white/30 focus:border-[#b7ff49]/40 focus:bg-white/[0.04]"
        />
      </label>
      <div aria-live="polite" className="min-h-[18px] text-[12px]">
        {error && <span className="text-red-300">{error}</span>}
        {done && !error && <span className="text-[#d0ff88]">Action recorded. The decision was re-evaluated.</span>}
      </div>
    </div>
  );

  if (bare) return body;

  return (
    <Card>
      <CardHeader icon={<Wrench className="h-4 w-4" />} title="Remediation" subtitle="Execute or override the recommendation. Every action is audited." />
      <div className="p-5">{body}</div>
    </Card>
  );
};
