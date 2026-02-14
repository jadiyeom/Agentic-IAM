import React from 'react';
import { IdentityViewModel, Role, assignRoleToIdentity } from '../services/iamApi';
import { RiskBadge } from './RiskBadge';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

import { deleteIdentity } from '../services/iamApi';

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
  const [selectedRole, setSelectedRole] = React.useState<{ [identityId: string]: string }>({});

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteIdentity(id);
      if (onDelete) onDelete(id);
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
      if (onRoleAssigned) onRoleAssigned(identityId);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-surfaceAlt/60 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">Identities</h2>
          <p className="text-xs text-slate-400">
            {identities.length} identities evaluated by the agentic engine.
          </p>
        </div>
      </div>
      <div className="max-h-[460px] overflow-y-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-surfaceAlt">
            <tr className="text-xs uppercase text-slate-400">
              <th className="px-4 py-2 font-medium">Identity</th>
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">Roles</th>
              <th className="px-4 py-2 font-medium">Risk</th>
              <th className="px-4 py-2 font-medium">Decision</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {identities.map((vm) => {
              const isSelected = vm.identity.id === selectedId;
              const decision = vm.decision.outcome;
              const isHighRisk = vm.anomaly || vm.risk.riskScore >= 70;
              return (
                <tr
                  key={vm.identity.id}
                  onClick={() => onSelect(vm.identity.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-500/10' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-2 align-top">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                          isHighRisk
                            ? 'border-danger/60 bg-danger/10 text-danger'
                            : 'border-accent/60 bg-accent/10 text-accent'
                        }`}
                      >
                        {vm.identity.name
                          .split(' ')
                          .map((x) => x[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-50">{vm.identity.name}</div>
                        <div className="text-xs text-slate-400">{vm.identity.attributes.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 align-top text-xs text-slate-300">
                    <div>{vm.identity.attributes.department}</div>
                    <div className="text-[10px] text-slate-500">{vm.identity.attributes.location}</div>
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-slate-200">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {vm.identity.roles.map((r) => (
                        <span
                          key={r}
                          className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-[10px]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <form className="flex gap-1 mt-1" onSubmit={e => handleAssignRole(e, vm.identity.id)}>
                      <select
                        className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-100"
                        value={selectedRole[vm.identity.id] || ''}
                        onChange={e => setSelectedRole(s => ({ ...s, [vm.identity.id]: e.target.value }))}
                        disabled={assigningId === vm.identity.id}
                        required
                      >
                        <option value="">Assign role...</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-accent px-2 py-0.5 text-xs text-slate-900 hover:bg-accentSoft disabled:opacity-60"
                        disabled={assigningId === vm.identity.id || !selectedRole[vm.identity.id]}
                      >
                        {assigningId === vm.identity.id ? 'Assigning...' : 'Assign'}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <RiskBadge score={vm.risk.riskScore} anomaly={vm.anomaly} />
                  </td>
                  <td className="px-4 py-2 align-top text-xs">
                    <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                      {isHighRisk ? (
                        <AlertTriangle className="h-3 w-3 text-danger" />
                      ) : (
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      )}
                      <span className="text-slate-200">{decision}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <button
                      className="rounded bg-danger px-2 py-0.5 text-xs text-white hover:bg-danger/80 disabled:opacity-60"
                      onClick={e => handleDelete(e, vm.identity.id)}
                      disabled={deletingId === vm.identity.id}
                    >
                      {deletingId === vm.identity.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

