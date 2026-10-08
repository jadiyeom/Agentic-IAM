import React from 'react';
import { IdentityViewModel, Role } from '../services/iamApi';
import { RiskBadge } from './RiskBadge';
import { ChevronRight, Users } from 'lucide-react';
import { Avatar, EmptyState, OutcomeBadge, Skeleton, riskTier } from './ui';

export const IdentityTable: React.FC<{
  identities: IdentityViewModel[];
  selectedId?: string;
  onSelect: (id: string) => void;
  roles: Role[];
  loading?: boolean;
}> = ({ identities, selectedId, onSelect, roles, loading = false }) => {
  const roleName = (id: string) => roles.find(r => r.id === id)?.name ?? id;

  const onKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); }
  };

  if (loading) {
    return (
      <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-[#0d0e10] p-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  if (identities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d0e10]">
        <EmptyState icon={<Users className="h-4 w-4" />} title="No identities match" text="Try clearing a filter or searching for a different name or title." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0e10]">
      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-white/[0.06] md:hidden">
        {identities.map(vm => {
          const active = vm.identity.id === selectedId;
          return (
            <li key={vm.identity.id}>
              <button type="button" onClick={() => onSelect(vm.identity.id)} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${active ? 'bg-white/[0.05]' : 'active:bg-white/[0.04]'}`}>
                <Avatar name={vm.identity.name} tier={riskTier(vm.risk.riskScore, vm.anomaly)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-white">{vm.identity.name}</span>
                  <span className="block truncate text-[12px] text-white/50">{vm.identity.attributes.title} · {vm.identity.attributes.department}</span>
                </span>
                <RiskBadge score={vm.risk.riskScore} anomaly={vm.anomaly} />
                <ChevronRight className="h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="scroll-quiet hidden max-h-[680px] overflow-auto md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Identities and their current risk and decision</caption>
          <thead className="sticky top-0 z-10 bg-[#0d0e10]/95 backdrop-blur">
            <tr className="border-b border-white/[0.07] text-[11px] font-medium uppercase tracking-[0.1em] text-white/50">
              <th scope="col" className="px-5 py-3 font-medium">Identity</th>
              <th scope="col" className="px-4 py-3 font-medium">Department</th>
              <th scope="col" className="hidden px-4 py-3 font-medium 2xl:table-cell">Access</th>
              <th scope="col" className="px-4 py-3 font-medium">Risk</th>
              <th scope="col" className="px-4 py-3 font-medium">Decision</th>
              <th scope="col" className="w-10 px-4 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {identities.map(vm => {
              const active = vm.identity.id === selectedId;
              return (
                <tr
                  key={vm.identity.id}
                  tabIndex={0}
                  aria-selected={active}
                  onClick={() => onSelect(vm.identity.id)}
                  onKeyDown={e => onKey(e, vm.identity.id)}
                  className={`group cursor-pointer border-b border-white/[0.05] outline-none transition-colors last:border-b-0 focus-visible:bg-white/[0.04] ${active ? 'bg-white/[0.05] shadow-[inset_2px_0_0_#b7ff49]' : 'hover:bg-white/[0.025]'}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={vm.identity.name} tier={riskTier(vm.risk.riskScore, vm.anomaly)} />
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-white">{vm.identity.name}</div>
                        <div className="mt-0.5 text-[12px] text-white/50">{vm.identity.attributes.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-[13px] text-white/75">{vm.identity.attributes.department}</div>
                    <div className="mt-0.5 text-[11px] text-white/45">{vm.identity.attributes.location}</div>
                  </td>
                  <td className="hidden px-4 py-3.5 2xl:table-cell">
                    <div className="flex max-w-[280px] flex-wrap gap-1.5">
                      {vm.identity.roles.length ? vm.identity.roles.map(r => (
                        <span key={r} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/65">{roleName(r)}</span>
                      )) : <span className="text-[12px] text-white/40">No roles</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><RiskBadge score={vm.risk.riskScore} anomaly={vm.anomaly} /></td>
                  <td className="px-4 py-3.5"><OutcomeBadge outcome={vm.decision.outcome} /></td>
                  <td className="px-4 py-3.5 text-right">
                    <ChevronRight className={`ml-auto h-4 w-4 transition ${active ? 'text-[#b7ff49]' : 'text-white/30 group-hover:translate-x-0.5 group-hover:text-white/60'}`} aria-hidden="true" />
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
