import React, { useEffect, useMemo, useState } from 'react';
import { fetchIdentities, IdentityViewModel, createIdentity, fetchRoles, Role } from '../services/iamApi';
import { IdentityTable } from '../components/IdentityTable';
import { IdentityInspector } from '../components/IdentityInspector';
import { RiskLegend } from '../components/RiskLegend';
import { PageHeader, StatCard } from '../components/ui';
import { CheckCircle2, MousePointerClick, Plus, Scale, Search, ShieldAlert, Users, X } from 'lucide-react';

const useIsWide = () => {
  const query = '(min-width: 1280px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
};

export const Identities: React.FC = () => {
  const isWide = useIsWide();
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newIdentity, setNewIdentity] = useState({
    name: '', department: '', title: '', seniority: 'INTERN', employmentType: 'INTERN', location: '', roles: [], entitlements: [],
  });

  const refresh = async () => {
    const ids = await fetchIdentities();
    setIdentities(ids);
    setLoading(false);
    setSelectedId(current => current && ids.some(x => x.identity.id === current) ? current : [...ids].sort((a, b) => b.risk.riskScore - a.risk.riskScore)[0]?.identity.id);
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    fetchRoles().then(setRoles).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!drawerOpen || isWide) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, isWide]);

  const departments = useMemo(() => Array.from(new Set(identities.map(i => i.identity.attributes.department))).sort(), [identities]);
  const filtered = useMemo(() => identities.filter(vm => {
    const query = search.trim().toLowerCase();
    if (query && !vm.identity.name.toLowerCase().includes(query) && !vm.identity.attributes.title.toLowerCase().includes(query)) return false;
    if (department && vm.identity.attributes.department !== department) return false;
    if (riskLevel === 'low' && vm.risk.riskScore > 5) return false;
    if (riskLevel === 'medium' && (vm.risk.riskScore < 6 || vm.risk.riskScore > 12)) return false;
    if (riskLevel === 'high' && vm.risk.riskScore < 13 && !vm.anomaly) return false;
    return true;
  }).sort((a, b) => b.risk.riskScore - a.risk.riskScore), [identities, search, department, riskLevel]);

  const highRisk = identities.filter(x => x.risk.riskScore >= 13 || x.anomaly).length;
  const violations = identities.reduce((n, x) => n + x.policy.violations.length, 0);
  const approved = identities.filter(x => String(x.decision.outcome).toUpperCase() === 'APPROVE').length;
  const selected = identities.find(x => x.identity.id === selectedId);
  const filtersActive = Boolean(search || department || riskLevel);

  function select(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  async function handleCreateIdentity(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createIdentity({
        name: newIdentity.name,
        attributes: {
          department: newIdentity.department,
          title: newIdentity.title,
          seniority: newIdentity.seniority as any,
          employmentType: newIdentity.employmentType as any,
          location: newIdentity.location,
        },
        roles: [], entitlements: [],
      });
      setShowCreate(false);
      setNewIdentity({ name: '', department: '', title: '', seniority: 'INTERN', employmentType: 'INTERN', location: '', roles: [], entitlements: [] });
      await refresh();
      if (created?.id) setSelectedId(created.id);
    } catch {
      setCreateError('Failed to create identity.');
    } finally {
      setCreating(false);
    }
  }

  const inspector = selected ? (
    <IdentityInspector
      viewModel={selected}
      roles={roles}
      onClose={isWide ? undefined : () => setDrawerOpen(false)}
      onChanged={refresh}
      onDeleted={async () => { setSelectedId(undefined); setDrawerOpen(false); await refresh(); }}
    />
  ) : null;

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
      <div className="animate-rise">
        <PageHeader
          eyebrow="Workspace"
          title="Identities"
          description="Human, service and agent identities, ranked by risk. Select one to see why the agents decided what they did, and act on it."
          icon={<Users className="h-5 w-5" />}
          actions={
            <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#b7ff49] px-4 text-[13px] font-semibold text-[#08090a] transition hover:bg-[#d0ff88]">
              <Plus className="h-4 w-4" /> Create identity
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
          <StatCard label="Identities" value={loading ? '–' : identities.length} detail="Evaluated by the pipeline" icon={<Users />} />
          <StatCard label="High risk" value={loading ? '–' : highRisk} detail="Score 13+ or anomalous" icon={<ShieldAlert />} tone={highRisk ? 'danger' : 'default'} />
          <StatCard label="Policy violations" value={loading ? '–' : violations} detail="Across all identities" icon={<Scale />} />
          <StatCard label="Approved" value={loading ? '–' : approved} detail="Current decisions" icon={<CheckCircle2 />} tone="lime" />
        </div>

        <div className="flex flex-col gap-3 pb-5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <label htmlFor="identity-search" className="sr-only">Search identities</label>
            <input id="identity-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or title" className="h-10 w-full rounded-full border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-[13px] text-white outline-none transition placeholder:text-white/35 focus:border-[#b7ff49]/40 focus:bg-white/[0.05]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="dept-filter" className="sr-only">Department</label>
            <select id="dept-filter" value={department} onChange={e => setDepartment(e.target.value)} className="h-10 rounded-full border border-white/[0.1] bg-[#0d0e11] px-4 text-[13px] text-white/80 outline-none [color-scheme:dark] focus:border-[#b7ff49]/40">
              <option value="">All departments</option>
              {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
            <div role="radiogroup" aria-label="Risk level" className="flex h-10 items-center rounded-full border border-white/[0.1] bg-white/[0.02] p-1 text-[12px]">
              {[['', 'All'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, l]) => (
                <button key={l} type="button" role="radio" aria-checked={riskLevel === v} onClick={() => setRiskLevel(v)} className={`h-8 rounded-full px-3 transition ${riskLevel === v ? 'bg-white/[0.1] text-white' : 'text-white/55 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            {filtersActive && (
              <button type="button" onClick={() => { setSearch(''); setDepartment(''); setRiskLevel(''); }} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[12px] text-white/55 hover:text-white">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          <RiskLegend className="hidden lg:ml-auto lg:flex" />
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between text-[12px] text-white/50">
              <span><span className="font-medium text-white">{filtered.length}</span> of {identities.length} identities · sorted by risk</span>
              <span className="hidden items-center gap-1.5 md:flex"><MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />Select a row to inspect</span>
            </div>
            <IdentityTable identities={filtered} selectedId={selectedId} onSelect={select} roles={roles} loading={loading} />
          </div>

          {isWide && (
            <aside aria-label="Identity inspector" className="scroll-quiet sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0e10]">
              {inspector ?? <div className="p-8 text-center text-[13px] text-white/50">Select an identity to inspect it.</div>}
            </aside>
          )}
        </div>
      </div>

      {!isWide && drawerOpen && inspector && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
          <aside role="dialog" aria-modal="true" aria-label={`Inspect ${selected?.identity.name}`} className="animate-drawer scroll-quiet h-full w-full max-w-[460px] overflow-y-auto border-l border-white/10 bg-[#0d0e10] shadow-2xl">
            {inspector}
          </aside>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <form onSubmit={handleCreateIdentity} role="dialog" aria-modal="true" aria-labelledby="create-identity-title" className="w-full max-w-lg animate-modal overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e11] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div><h2 id="create-identity-title" className="text-base font-semibold">Create identity</h2><p className="mt-1 text-[12px] text-white/55">Add a new identity to the evaluation graph.</p></div>
              <button type="button" onClick={() => setShowCreate(false)} aria-label="Close" className="rounded-md p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Field label="Name" value={newIdentity.name} onChange={v => setNewIdentity({...newIdentity, name:v})} placeholder="e.g. Alex Morgan" />
              <Field label="Department" value={newIdentity.department} onChange={v => setNewIdentity({...newIdentity, department:v})} placeholder="Engineering" />
              <Field label="Title" value={newIdentity.title} onChange={v => setNewIdentity({...newIdentity, title:v})} placeholder="Software Engineer" />
              <Field label="Location" value={newIdentity.location} onChange={v => setNewIdentity({...newIdentity, location:v})} placeholder="Pune" />
              <SelectField label="Seniority" value={newIdentity.seniority} onChange={v => setNewIdentity({...newIdentity, seniority:v})} options={['INTERN','JUNIOR','MID','SENIOR','EXECUTIVE']} />
              <SelectField label="Employment type" value={newIdentity.employmentType} onChange={v => setNewIdentity({...newIdentity, employmentType:v})} options={['FULL_TIME','CONTRACTOR','INTERN']} />
            </div>
            {createError && <div className="mx-6 mb-4 rounded-md border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-[12px] text-red-300">{createError}</div>}
            <div className="flex justify-end gap-2 border-t border-white/[0.08] px-6 py-4">
              <button type="button" onClick={() => setShowCreate(false)} disabled={creating} className="h-9 rounded-md border border-white/10 px-4 text-[12px] text-white/55 transition hover:bg-white/[0.05] hover:text-white">Cancel</button>
              <button type="submit" disabled={creating} className="h-9 rounded-md bg-white px-4 text-[12px] font-medium text-black transition hover:bg-white/90 disabled:opacity-50">{creating ? 'Creating...' : 'Create identity'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

function Field({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string}) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/65">{label}</span><input required value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#b7ff49]/40" /></label>;
}
function SelectField({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/65">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-[7px] border border-white/10 bg-white/[0.035] px-3 text-[13px] text-white outline-none [color-scheme:dark] focus:border-[#b7ff49]/40 focus:ring-1 focus:ring-[#b7ff49]/15">{options.map(x=><option key={x} value={x}>{x.replace('_',' ')}</option>)}</select></label>;
}
