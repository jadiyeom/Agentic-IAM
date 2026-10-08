import React, { useEffect, useMemo, useState } from 'react';
import { fetchIdentities, IdentityViewModel, createIdentity, fetchRoles, Role } from '../services/iamApi';
import { IdentityTable } from '../components/IdentityTable';
import { RiskLegend } from '../components/RiskLegend';
import { ArrowLeft, Plus, Search, SlidersHorizontal, Users, ShieldAlert, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Identities: React.FC = () => {
  const navigate=useNavigate();
  const [identities,setIdentities]=useState<IdentityViewModel[]>([]);
  const [roles,setRoles]=useState<Role[]>([]);
  const [selectedId,setSelectedId]=useState<string|undefined>();
  const [search,setSearch]=useState('');
  const [department,setDepartment]=useState('');
  const [riskLevel,setRiskLevel]=useState('');
  const [highRiskOnly,setHighRiskOnly]=useState(false);
  const [showCreate,setShowCreate]=useState(false);
  const [creating,setCreating]=useState(false);
  const [createError,setCreateError]=useState<string|null>(null);
  const [newIdentity,setNewIdentity]=useState({name:'',department:'',title:'',seniority:'INTERN',employmentType:'INTERN',location:''});

  const refresh=async()=>{const ids=await fetchIdentities();setIdentities(ids);setSelectedId(cur=>cur&&ids.some(x=>x.identity.id===cur)?cur:ids[0]?.identity.id);};
  useEffect(()=>{refresh();fetchRoles().then(setRoles);},[]);
  const departments=useMemo(()=>Array.from(new Set(identities.map(i=>i.identity.attributes.department))),[identities]);
  const filtered=useMemo(()=>identities.filter(vm=>{
    const q=search.trim().toLowerCase();
    if(q&&!vm.identity.name.toLowerCase().includes(q)&&!vm.identity.attributes.title.toLowerCase().includes(q))return false;
    if(department&&vm.identity.attributes.department!==department)return false;
    if(riskLevel==='low'&&vm.risk.riskScore>5)return false;
    if(riskLevel==='medium'&&(vm.risk.riskScore<6||vm.risk.riskScore>12))return false;
    if(riskLevel==='high'&&vm.risk.riskScore<13)return false;
    if(highRiskOnly&&vm.risk.riskScore<13)return false;
    return true;
  }),[identities,search,department,riskLevel,highRiskOnly]);

  const highRisk=identities.filter(x=>x.risk.riskScore>=13||x.anomaly).length;
  const approved=identities.filter(x=>String(x.decision.outcome).toUpperCase()==='APPROVE').length;
  const selected=identities.find(x=>x.identity.id===selectedId);

  async function handleCreate(e:React.FormEvent){
    e.preventDefault();setCreating(true);setCreateError(null);
    try{
      await createIdentity({name:newIdentity.name,attributes:{department:newIdentity.department,title:newIdentity.title,seniority:newIdentity.seniority as any,employmentType:newIdentity.employmentType as any,location:newIdentity.location},roles:[],entitlements:[]});
      setShowCreate(false);setNewIdentity({name:'',department:'',title:'',seniority:'INTERN',employmentType:'INTERN',location:''});await refresh();
    }catch{setCreateError('Failed to create identity.');}finally{setCreating(false);}
  }

  return <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
    <div className="animate-rise">
      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button onClick={()=>navigate('/login',{replace:true})} className="mb-5 inline-flex items-center gap-2 text-[12px] text-white/35 hover:text-white"><ArrowLeft className="h-3.5 w-3.5"/>Back to landing</button>
          <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045]"><Users className="h-5 w-5 text-white/60"/></div><div><h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-3xl">Identities</h1><p className="mt-1.5 max-w-2xl text-[13px] text-white/38">Human, service, and AI-agent identities evaluated continuously for access risk.</p></div></div>
        </div>
        <button onClick={()=>setShowCreate(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-[13px] font-medium text-black hover:bg-white/90"><Plus className="h-4 w-4"/>Create identity</button>
      </div>

      <div className="grid gap-px border-b border-white/[0.08] bg-white/[0.07] sm:grid-cols-3">
        <Stat label="Total identities" value={String(identities.length)} detail="Currently evaluated" icon={<Users/>}/>
        <Stat label="High-risk identities" value={String(highRisk)} detail="Require attention" icon={<ShieldAlert/>} danger/>
        <Stat label="Approved decisions" value={String(approved)} detail="Current policy outcomes" icon={<CheckCircle2/>}/>
      </div>

      <div className="border-b border-white/[0.08] py-4"><div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1 xl:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/22"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search identities or titles..." className="h-10 w-full rounded-md border border-white/[0.1] bg-white/[0.035] pl-9 pr-3 text-[13px] outline-none placeholder:text-white/23 focus:border-white/20 focus:bg-white/[0.05]"/></div>
        <div className="flex flex-wrap gap-2"><select value={department} onChange={e=>setDepartment(e.target.value)} className="h-10 rounded-md border border-white/[0.1] bg-[#0d0e11] px-3 text-[12px] text-white/70 outline-none"><option value="">All departments</option>{departments.map(x=><option key={x}>{x}</option>)}</select><select value={riskLevel} onChange={e=>setRiskLevel(e.target.value)} className="h-10 rounded-md border border-white/[0.1] bg-[#0d0e11] px-3 text-[12px] text-white/70 outline-none"><option value="">All risk levels</option><option value="low">Low risk</option><option value="medium">Medium risk</option><option value="high">High risk</option></select><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.025] px-3 text-[12px] text-white/45"><input type="checkbox" checked={highRiskOnly} onChange={e=>setHighRiskOnly(e.target.checked)} className="accent-white"/>High risk only</label><div className="hidden items-center gap-2 xl:flex"><SlidersHorizontal className="h-3.5 w-3.5 text-white/20"/><RiskLegend/></div></div>
      </div></div>

      <div className="flex items-center justify-between py-5"><div><div className="text-[13px] font-medium">{filtered.length} identities</div><div className="mt-1 text-[11px] text-white/28">Select a row to inspect its security context.</div></div><div className="hidden text-[11px] text-white/25 sm:block">{selected ? 'Selected: '+selected.identity.name : 'No selection'}</div></div>
      <IdentityTable identities={filtered} selectedId={selectedId} onSelect={setSelectedId} onDelete={refresh} roles={roles} onRoleAssigned={refresh}/>
      {selected && <IdentityDetail viewModel={selected}/>}
    </div>

    {showCreate&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"><form onSubmit={handleCreate} className="w-full max-w-lg animate-modal overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5"><div><h2 className="text-base font-semibold">Create identity</h2><p className="mt-1 text-[12px] text-white/35">Add an identity to the evaluation graph.</p></div><button type="button" onClick={()=>setShowCreate(false)} className="rounded-md p-2 text-white/35 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4"/></button></div>
      <div className="grid gap-4 p-6 sm:grid-cols-2"><Field label="Name" value={newIdentity.name} onChange={v=>setNewIdentity(s=>({...s,name:v}))} placeholder="Alex Morgan"/><Field label="Department" value={newIdentity.department} onChange={v=>setNewIdentity(s=>({...s,department:v}))} placeholder="Engineering"/><Field label="Title" value={newIdentity.title} onChange={v=>setNewIdentity(s=>({...s,title:v}))} placeholder="Software Engineer"/><Field label="Location" value={newIdentity.location} onChange={v=>setNewIdentity(s=>({...s,location:v}))} placeholder="Pune"/><SelectField label="Seniority" value={newIdentity.seniority} onChange={v=>setNewIdentity(s=>({...s,seniority:v}))} options={['INTERN','JUNIOR','MID','SENIOR','EXECUTIVE']}/><SelectField label="Employment type" value={newIdentity.employmentType} onChange={v=>setNewIdentity(s=>({...s,employmentType:v}))} options={['FULL_TIME','CONTRACTOR','INTERN']}/></div>
      {createError&&<div className="mx-6 mb-4 rounded-md border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-[12px] text-red-300">{createError}</div>}
      <div className="flex justify-end gap-2 border-t border-white/[0.08] px-6 py-4"><button type="button" onClick={()=>setShowCreate(false)} className="h-9 rounded-md border border-white/10 px-4 text-[12px] text-white/55 hover:bg-white/[0.05] hover:text-white">Cancel</button><button type="submit" disabled={creating} className="h-9 rounded-md bg-white px-4 text-[12px] font-medium text-black disabled:opacity-50">{creating?'Creating...':'Create identity'}</button></div>
    </form></div>}
  </div>;
};

function IdentityDetail({viewModel:vm}:{viewModel:IdentityViewModel}){
  const {identity,risk,policy,decision,audit}=vm;
  const score=risk.riskScore;
  const tone=score>=70?'text-red-300':score>=40?'text-amber-300':'text-emerald-300';
  return <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c0f]">
    <div className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[10px] uppercase tracking-[.15em] text-white/25">Identity investigation</div><h2 className="mt-1 text-[17px] font-medium">{identity.name}</h2><p className="mt-1 text-[12px] text-white/30">{identity.attributes.title} · {identity.attributes.department} · {identity.attributes.location}</p></div><div className="flex items-center gap-2"><span className={'rounded-md border px-2.5 py-1 text-[11px] '+tone}>{'Risk '+score+'/100'}</span><span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/55">{String(decision.outcome).replaceAll('_',' ')}</span></div></div>
    <div className="grid divide-y divide-white/[0.07] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      <div className="p-5"><Label title="Identity context"/><div className="mt-4 space-y-3 text-[12px]"><Pair k="Seniority" v={identity.attributes.seniority}/><Pair k="Employment" v={identity.attributes.employmentType}/><Pair k="Roles" v={identity.roles.length?identity.roles.join(', '):'None assigned'}/><Pair k="Entitlements" v={String(identity.entitlements.length)}/></div></div>
      <div className="p-5"><Label title="Risk signals"/><div className="mt-4 space-y-3">{[['Role sensitivity',risk.factors.roleSensitivityScore],['Seniority alignment',risk.factors.seniorityAlignmentScore],['Peer anomaly',risk.factors.peerAnomalyScore],['Historical change',risk.factors.historicalChangeScore]].map(([k,v])=><div key={String(k)} className="flex items-center justify-between text-[12px]"><span className="text-white/38">{String(k)}</span><span className="font-mono text-white/65">{String(v)}</span></div>)}</div></div>
      <div className="p-5"><Label title="Decision evidence"/><div className="mt-4 space-y-3 text-[12px]"><Pair k="Policy violations" v={String(policy.violations.length)}/><Pair k="Confidence" v={String(Math.round(decision.confidence*100))+'%'}/><Pair k="Engine" v={decision.usedLLM?'LLM-assisted':'Heuristic'}/><Pair k="Evaluated" v={new Date(audit.timestamp).toLocaleTimeString()}/></div></div>
    </div>
    <div className="border-t border-white/[0.07] bg-white/[0.015] px-5 py-5"><div className="flex items-start gap-3"><ChevronRight className="mt-0.5 h-4 w-4 text-white/30"/><div><div className="text-[11px] uppercase tracking-[.12em] text-white/25">Why this decision</div><p className="mt-2 max-w-4xl text-[13px] leading-6 text-white/48">{decision.rationale||audit.explanation}</p></div></div></div>
  </section>;
}
function Label({title}:{title:string}){return <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-white/25"><span className="h-1 w-1 rounded-full bg-white/30"/>{title}</div>}
function Pair({k,v}:{k:string;v:string}){return <div className="flex justify-between gap-4"><span className="text-white/35">{k}</span><span className="max-w-[65%] text-right text-white/65">{v}</span></div>}
function Stat({label,value,detail,icon,danger}:{label:string;value:string;detail:string;icon:React.ReactNode;danger?:boolean}){return <div className="bg-[#0b0c0f] p-5"><div className="flex items-center justify-between"><span className="text-[11px] text-white/35">{label}</span><span className={danger?'text-red-300/70':'text-white/25'}>{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4'})}</span></div><div className={'mt-3 text-2xl font-semibold tracking-[-.03em] '+(danger?'text-red-200':'text-white')}>{value}</div><div className="mt-1 text-[10px] text-white/25">{detail}</div></div>}
function Field({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string}){return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/45">{label}</span><input required value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-white/20"/></label>}
function SelectField({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/45">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-[13px] text-white outline-none">{options.map(x=><option key={x}>{x.replaceAll('_',' ')}</option>)}</select></label>}
