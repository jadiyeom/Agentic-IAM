import React from 'react';
import { IdentityViewModel, Role, assignRoleToIdentity, deleteIdentity } from '../services/iamApi';
import { Briefcase, KeyRound, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { Avatar, OutcomeBadge, SensitivityBadge, providerLabel, riskTier, tierStyles } from './ui';
import { PolicyViolations, RiskFactors } from './ExplainabilityPanel';
import { RemediationActions } from './RemediationActions';

interface Props {
  viewModel: IdentityViewModel;
  roles: Role[];
  onClose?: () => void;
  onChanged: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
}

const Section: React.FC<{ title: string; children: React.ReactNode; aside?: React.ReactNode }> = ({ title, children, aside }) => (
  <section className="border-t border-white/[0.07] px-5 py-5">
    <div className="mb-3.5 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">{title}</h3>
      {aside}
    </div>
    {children}
  </section>
);

export const IdentityInspector: React.FC<Props> = ({ viewModel, roles, onClose, onChanged, onDeleted }) => {
  const { identity, risk, decision } = viewModel;
  const tier = riskTier(risk.riskScore, viewModel.anomaly);
  const [roleId, setRoleId] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => { setRoleId(''); setConfirmDelete(false); }, [identity.id]);

  const assigned = identity.roles.map(id => roles.find(r => r.id === id) ?? { id, name: id, sensitivity: 'LOW', description: '', domains: [] as string[] } as Role);
  const available = roles.filter(r => !identity.roles.includes(r.id));

  async function assign(e: React.FormEvent) {
    e.preventDefault();
    if (!roleId) return;
    setAssigning(true);
    try {
      await assignRoleToIdentity(identity.id, roleId);
      setRoleId('');
      await onChanged();
    } finally {
      setAssigning(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await deleteIdentity(identity.id);
      await onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-4 px-5 pb-5 pt-5">
        <Avatar name={identity.name} tier={tier} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[18px] font-semibold tracking-[-0.02em] text-white">{identity.name}</h2>
          <p className="mt-0.5 truncate text-[13px] text-white/60">{identity.attributes.title}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" aria-hidden="true" />{identity.attributes.department}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{identity.attributes.location}</span>
            <span>{identity.attributes.employmentType.replace('_', ' ').toLowerCase()}</span>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close inspector" className="rounded-lg p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 pb-5">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="text-[11px] text-white/50">Risk score</div>
          <div className={`mt-1.5 text-[24px] font-semibold leading-none tabular-nums ${tierStyles[tier].text}`}>{risk.riskScore}</div>
          <div className="mt-1.5 text-[11px] text-white/45">{viewModel.anomaly ? 'Anomaly detected' : `${tierStyles[tier].label} risk`}</div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="text-[11px] text-white/50">Decision</div>
          <div className="mt-2"><OutcomeBadge outcome={decision.outcome} /></div>
          <div className="mt-2 text-[11px] text-white/45">{Math.round(decision.confidence * 100)}% · {providerLabel(decision.decisionProvider)}</div>
        </div>
      </div>

      <Section title="Why">
        <p className="border-l-2 border-[#b7ff49]/50 pl-3.5 text-[13px] leading-6 text-white/80">{decision.rationale}</p>
      </Section>

      <Section title="Risk composition">
        <RiskFactors viewModel={viewModel} />
      </Section>

      <Section title="Policy">
        <PolicyViolations viewModel={viewModel} />
      </Section>

      <Section title="Access" aside={<span className="text-[11px] tabular-nums text-white/40">{assigned.length} role{assigned.length === 1 ? '' : 's'}</span>}>
        {assigned.length === 0 ? (
          <p className="text-[12px] text-white/50">No roles assigned.</p>
        ) : (
          <ul className="space-y-2">
            {assigned.map(r => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
                <span className="flex min-w-0 items-center gap-2.5">
                  <KeyRound className="h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true" />
                  <span className="truncate text-[13px] text-white/80">{r.name}</span>
                </span>
                <SensitivityBadge level={r.sensitivity} />
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={assign} className="mt-3 flex gap-2">
          <label className="sr-only" htmlFor={`assign-${identity.id}`}>Assign a role</label>
          <select
            id={`assign-${identity.id}`}
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            disabled={assigning || available.length === 0}
            className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#111216] px-3 text-[12px] text-white/80 outline-none [color-scheme:dark] focus:border-[#b7ff49]/40"
          >
            <option value="">{available.length ? 'Assign a role…' : 'All roles assigned'}</option>
            {available.map(r => <option key={r.id} value={r.id}>{r.name} · {r.sensitivity.toLowerCase()}</option>)}
          </select>
          <button type="submit" disabled={!roleId || assigning} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[12px] font-medium text-black transition hover:bg-white/90 disabled:opacity-30">
            {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
            Assign
          </button>
        </form>
        <p className="mt-2 text-[11px] text-white/40">Assigning a role re-runs the full agent pipeline for this identity.</p>
      </Section>

      <Section title="Remediation">
        <RemediationActions viewModel={viewModel} onActionCompleted={onChanged} bare />
      </Section>

      <div className="mt-auto border-t border-white/[0.07] px-5 py-4">
        {confirmDelete ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-white/60">Delete {identity.name} from the demo graph?</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-8 rounded-lg border border-white/10 px-3 text-[12px] text-white/65 hover:text-white">Cancel</button>
              <button type="button" onClick={remove} disabled={deleting} className="h-8 rounded-lg bg-red-500/90 px-3 text-[12px] font-medium text-white hover:bg-red-500 disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 text-[12px] text-red-300/70 transition hover:text-red-200">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete identity
          </button>
        )}
      </div>
    </div>
  );
};
