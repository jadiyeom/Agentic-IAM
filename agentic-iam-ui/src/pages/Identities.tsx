import React, { useEffect, useMemo, useState } from 'react';
import { fetchIdentities, IdentityViewModel, createIdentity, fetchRoles, Role } from '../services/iamApi';
import { IdentityTable } from '../components/IdentityTable';
import { RiskLegend } from '../components/RiskLegend';
import { ArrowLeft, Plus, Search, SlidersHorizontal, Users, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Identities: React.FC = () => {
  const navigate = useNavigate();
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newIdentity, setNewIdentity] = useState({
    name: '', department: '', title: '', seniority: 'INTERN', employmentType: 'INTERN', location: '', roles: [], entitlements: [],
  });

  const refresh = async () => {
    const ids = await fetchIdentities();
    setIdentities(ids);
    setSelectedId(current => current && ids.some(x => x.identity.id === current) ? current : ids[0]?.identity.id);
  };

  useEffect(() => {
    refresh();
    fetchRoles().then(setRoles);
  }, []);

  const departments = useMemo(() => Array.from(new Set(identities.map(i => i.identity.attributes.department))), [identities]);
  const filtered = useMemo(() => identities.filter(vm => {
    const query = search.trim().toLowerCase();
    if (query && !vm.identity.name.toLowerCase().includes(query) && !vm.identity.attributes.title.toLowerCase().includes(query)) return false;
    if (department && vm.identity.attributes.department !== department) return false;
    if (riskLevel === 'low' && vm.risk.riskScore > 5) return false;
    if (riskLevel === 'medium' && (vm.risk.riskScore < 6 || vm.risk.riskScore > 12)) return false;
    if (riskLevel === 'high' && vm.risk.riskScore < 13) return false;
    if (highRiskOnly && vm.risk.riskScore < 13) return false;
    return true;
  }), [identities, search, department, riskLevel, highRiskOnly]);

  const highRisk = identities.filter(x => x.risk.riskScore >= 13 || x.anomaly).length;
  const approved = identities.filter(x => String(x.decision.outcome).toUpperCase() === 'APPROVE').length;
  const selected = identities.find(x => x.identity.id === selectedId);

  async function handleCreateIdentity(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await createIdentity({
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
    } catch {
      setCreateError('Failed to create identity.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteIdentity() { await refresh(); }
  async function handleRoleAssigned() { await refresh(); }

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
      <div className="animate-rise">
        <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button onClick={() => navigate('/login', { replace: true })} className="mb-5 inline-flex items-center gap-2 text-[12px] text-white/40 transition hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to landing
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.045]"><Users className="h-5 w-5 text-white/60" /></div>
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Identities</h1>
                <p className="mt-1 text-[13px] text-white/40">Human, service, and agent identities evaluated by TrustLens.</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-[13px] font-medium text-black transition hover:bg-white/90">
            <Plus className="h-4 w-4" /> Create identity
          </button>
        </div>

        <div className="grid gap-3 py-6 sm:grid-cols-3">
          <Stat label="Total identities" value={String(identities.length)} detail="Currently evaluated" icon={<Users />} />
          <Stat label="High-risk identities" value={String(highRisk)} detail="Require attention" icon={<ShieldAlert />} danger />
          <Stat label="Approved decisions" value={String(approved)} detail="Current policy outcomes" icon={<CheckCircle2 />} />
        </div>

        <div className="border-y border-white/[0.08] py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1 xl:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search identities..." className="h-10 w-full rounded-md border border-white/[0.1] bg-white/[0.035] pl-9 pr-3 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.05]" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={department} onChange={e => setDepartment(e.target.value)} className="h-10 rounded-md border border-white/[0.1] bg-[#0d0e11] px-3 text-[13px] text-white/75 outline-none">
                <option value="">All departments</option>
                {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
              </select>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="h-10 rounded-md border border-white/[0.1] bg-[#0d0e11] px-3 text-[13px] text-white/75 outline-none">
                <option value="">All risk levels</option>
                <option value="low">Low risk</option>
                <option value="medium">Medium risk</option>
                <option value="high">High risk</option>
              </select>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.025] px-3 text-[12px] text-white/50">
                <input type="checkbox" checked={highRiskOnly} onChange={e => setHighRiskOnly(e.target.checked)} className="accent-white" />
                High risk only
              </label>
              <div className="hidden items-center gap-2 xl:flex xl:ml-auto"><SlidersHorizontal className="h-3.5 w-3.5 text-white/25" /><RiskLegend /></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-5">
          <div><div className="text-[13px] font-medium text-white">{filtered.length} identities</div><div className="mt-0.5 text-[12px] text-white/30">Select an identity to inspect its decision context.</div></div>
          <div className="text-[11px] text-white/25">{selected ? `Selected: ${selected.identity.name}` : 'No selection'}</div>
        </div>

        <IdentityTable identities={filtered} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDeleteIdentity} roles={roles} onRoleAssigned={handleRoleAssigned} />
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateIdentity} className="w-full max-w-lg animate-modal overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div><h2 className="text-base font-semibold">Create identity</h2><p className="mt-1 text-[12px] text-white/35">Add a new identity to the evaluation graph.</p></div>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-md p-2 text-white/35 transition hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
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

function Stat({label,value,detail,icon,danger}:{label:string;value:string;detail:string;icon:React.ReactNode;danger?:boolean}) {
  return <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.03]"><div className="flex items-center justify-between"><span className="text-[12px] text-white/40">{label}</span><span className={danger ? 'text-red-300/70' : 'text-white/30'}>{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4'})}</span></div><div className={`mt-3 text-2xl font-semibold tracking-[-0.03em] ${danger?'text-red-200':'text-white'}`}>{value}</div><div className="mt-1 text-[11px] text-white/25">{detail}</div></div>;
}

function Field({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string}) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/45">{label}</span><input required value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-white/20" /></label>;
}
function SelectField({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/45">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-[13px] text-white outline-none">{options.map(x=><option key={x} value={x}>{x.replace('_',' ')}</option>)}</select></label>;
}
