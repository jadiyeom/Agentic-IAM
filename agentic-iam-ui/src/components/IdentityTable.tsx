import React from 'react';
import { IdentityViewModel, Role, assignRoleToIdentity, deleteIdentity } from '../services/iamApi';
import { RiskBadge } from './RiskBadge';
import { AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';

export const IdentityTable: React.FC<{
  identities: IdentityViewModel[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  roles: Role[];
  onRoleAssigned?: (identityId: string) => void;
}> = ({ identities, selectedId, onSelect, onDelete, roles, onRoleAssigned }) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [assigningId, setAssigningId] = React.useState<string | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Record<string, string>>({});

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteIdentity(id);
      onDelete?.(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAssignRole(e: React.FormEvent, identityId: string) {
    e.stopPropagation();
    e.preventDefault();
    const roleId = selectedRole[identityId];
    if (!roleId) return;
    setAssigningId(identityId);
    try {
      await assignRoleToIdentity(identityId, roleId);
      onRoleAssigned?.(identityId);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.09] bg-[#0b0c0f] shadow-[0_18px_60px_rgba(0,0,0,.18)]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div>
          <h2 className="text-[14px] font-medium text-white">Identity access</h2>
          <p className="mt-1 text-[12px] text-white/30">{identities.length} records · evaluated continuously</p>
        </div>
        <div className="text-[11px] text-white/25">Click a row to inspect</div>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-[620px] overflow-y-auto">
          <table className="min-w-[1040px] w-full text-left">
            <thead className="sticky top-0 z-10 border-b border-white/[0.07] bg-[#0b0c0f]">
              <tr className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                <th className="px-5 py-3.5 font-medium">Identity</th>
                <th className="px-4 py-3.5 font-medium">Department</th>
                <th className="px-4 py-3.5 font-medium">Access</th>
                <th className="px-4 py-3.5 font-medium">Risk</th>
                <th className="px-4 py-3.5 font-medium">Decision</th>
                <th className="px-5 py-3.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {identities.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-[13px] text-white/30">No identities match the current filters.</td></tr>
              ) : identities.map(vm => {
                const isSelected = vm.identity.id === selectedId;
                const isHighRisk = vm.anomaly || vm.risk.riskScore >= 13;
                const decision = String(vm.decision.outcome || 'REVIEW').toUpperCase();
                return (
                  <tr
                    key={vm.identity.id}
                    onClick={() => onSelect(vm.identity.id)}
                    className={`group cursor-pointer border-b border-white/[0.055] transition-colors duration-150 last:border-b-0 ${
                      isSelected ? 'bg-white/[0.055]' : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border text-[11px] font-medium ${
                          isHighRisk ? 'border-red-400/25 bg-red-400/[0.06] text-red-200' : 'border-white/10 bg-white/[0.045] text-white/60'
                        }`}>
                          {vm.identity.name.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-white">{vm.identity.name}</div>
                          <div className="mt-0.5 text-[12px] text-white/35">{vm.identity.attributes.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <div className="text-[13px] text-white/70">{vm.identity.attributes.department}</div>
                      <div className="mt-0.5 text-[11px] text-white/25">{vm.identity.attributes.location}</div>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <div className="flex max-w-[340px] flex-wrap gap-1.5">
                        {vm.identity.roles.length ? vm.identity.roles.map(r => {
                          const roleObj = roles.find(role => role.id === r);
                          return <span key={r} className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1 text-[11px] text-white/60">{roleObj ? roleObj.name : r}</span>;
                        }) : <span className="text-[12px] text-white/25">No roles</span>}
                      </div>
                      <form className="mt-2.5 flex gap-1.5" onSubmit={e => handleAssignRole(e, vm.identity.id)}>
                        <select
                          className="h-8 min-w-[150px] rounded-md border border-white/10 bg-[#111216] px-2.5 text-[11px] text-white/60 outline-none focus:border-white/20"
                          value={selectedRole[vm.identity.id] || ''}
                          onChange={e => setSelectedRole(s => ({...s, [vm.identity.id]: e.target.value}))}
                          disabled={assigningId === vm.identity.id}
                        >
                          <option value="">Assign role...</option>
                          {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                        <button type="submit" disabled={assigningId === vm.identity.id || !selectedRole[vm.identity.id]} className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2.5 text-[11px] text-white/65 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-30">
                          {assigningId === vm.identity.id ? 'Assigning' : 'Assign'}
                        </button>
                      </form>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <RiskBadge score={vm.risk.riskScore} anomaly={vm.anomaly} />
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-white/65">
                        {isHighRisk ? <AlertTriangle className="h-3.5 w-3.5 text-red-300" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />}
                        {decision}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right align-middle">
                      <button
                        onClick={e => handleDelete(e, vm.identity.id)}
                        disabled={deletingId === vm.identity.id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-400/15 px-2.5 text-[11px] text-red-300/70 opacity-0 transition group-hover:opacity-100 hover:border-red-400/30 hover:bg-red-400/[0.07] hover:text-red-200 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === vm.identity.id ? 'Deleting' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
