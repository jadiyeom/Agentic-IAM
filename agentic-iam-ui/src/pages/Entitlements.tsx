import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, Database, Search, Users } from 'lucide-react';
import { fetchIdentities, getEntitlements, IdentityViewModel } from '../services/iamApi';
import { Card, EmptyState, PageHeader, SensitivityBadge, Skeleton, StatCard } from '../components/ui';

interface Entitlement {
  id: string;
  name: string;
  description: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  domains: string[];
}

const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;
const levels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

const Entitlements: React.FC = () => {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<(typeof levels)[number]>('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([getEntitlements().then(setEntitlements), fetchIdentities().then(setIdentities)])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const holders = useMemo(() => {
    const m: Record<string, string[]> = {};
    identities.forEach(vm => vm.identity.roles.forEach(r => { (m[r] ||= []).push(vm.identity.name); }));
    return m;
  }, [identities]);

  const list = useMemo(() => entitlements
    .filter(e => level === 'ALL' || e.sensitivity === level)
    .filter(e => !query.trim() || `${e.name} ${e.description} ${e.domains.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => order[a.sensitivity] - order[b.sensitivity] || a.name.localeCompare(b.name)), [entitlements, level, query]);

  const critical = entitlements.filter(e => e.sensitivity === 'CRITICAL' || e.sensitivity === 'HIGH').length;
  const domains = new Set(entitlements.flatMap(e => e.domains)).size;

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
      <div className="animate-rise">
        <PageHeader
          eyebrow="Workspace"
          title="Entitlements"
          description="Every role an identity can hold, with how sensitive it is, what it reaches, and who holds it today."
          icon={<Boxes className="h-5 w-5" />}
        />

        <div className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-3">
          <StatCard label="Roles" value={loading ? '–' : entitlements.length} detail="Defined in the catalog" icon={<Boxes />} />
          <StatCard label="High or critical" value={loading ? '–' : critical} detail="Need tighter review" icon={<Database />} tone={critical ? 'danger' : 'default'} />
          <StatCard label="Resource domains" value={loading ? '–' : domains} detail="Systems these roles reach" icon={<Users />} />
        </div>

        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <label htmlFor="ent-search" className="sr-only">Search entitlements</label>
            <input id="ent-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search roles or domains" className="h-10 w-full rounded-full border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-[#b7ff49]/40" />
          </div>
          <div role="radiogroup" aria-label="Sensitivity" className="scroll-quiet flex h-10 items-center overflow-x-auto rounded-full border border-white/[0.1] bg-white/[0.02] p-1 text-[12px]">
            {levels.map(l => (
              <button key={l} type="button" role="radio" aria-checked={level === l} onClick={() => setLevel(l)} className={`h-8 shrink-0 rounded-full px-3 capitalize transition ${level === l ? 'bg-white/[0.1] text-white' : 'text-white/55 hover:text-white'}`}>{l.toLowerCase()}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
        ) : list.length === 0 ? (
          <Card><EmptyState icon={<Boxes className="h-4 w-4" />} title="No roles match" text="Try a different sensitivity level or search term." /></Card>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map(ent => {
              const who = holders[ent.id] ?? [];
              return (
                <li key={ent.id} className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0d0e10] p-5 transition hover:border-white/[0.15]">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[15px] font-medium text-white">{ent.name}</h2>
                    <SensitivityBadge level={ent.sensitivity} />
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-white/60">{ent.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {ent.domains.map(d => <span key={d} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/65">{d}</span>)}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4 text-[12px] mt-5">
                    <span className="text-white/50">Held by</span>
                    <span className="truncate pl-3 text-right text-white/75">{who.length ? who.join(', ') : <span className="text-white/40">nobody</span>}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Entitlements;
