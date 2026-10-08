import React,{useEffect,useState} from 'react';
import {fetchIdentities,IdentityViewModel} from '../services/iamApi';
import {ExplainabilityPanel} from '../components/ExplainabilityPanel';
import {RemediationActions} from '../components/RemediationActions';
import {FileSearch,ShieldAlert,CheckCircle2,Clock3,ChevronRight} from 'lucide-react';

export const ExplainAudit:React.FC=()=>{
 const [ids,setIds]=useState<IdentityViewModel[]>([]); const [selectedId,setSelectedId]=useState<string>();
 const refresh=()=>fetchIdentities().then(x=>{setIds(x);setSelectedId(cur=>cur&&x.some(i=>i.identity.id===cur)?cur:x[0]?.identity.id);});
 useEffect(()=>{refresh();},[]);
 const selected=ids.find(x=>x.identity.id===selectedId)||null;
 return <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
  <div className="border-b border-white/[0.08] pb-7"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.045]"><FileSearch className="h-5 w-5 text-white/55"/></div><div><h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-3xl">Audit & decisions</h1><p className="mt-1.5 text-[13px] text-white/38">Reconstruct why access was allowed, flagged, or recommended for remediation.</p></div></div></div>
  <div className="mt-6 grid gap-4 lg:grid-cols-[330px_1fr]">
   <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c0f]"><div className="border-b border-white/[0.07] px-4 py-3"><div className="text-[10px] uppercase tracking-[.14em] text-white/25">Recent evaluations</div></div><div className="max-h-[620px] overflow-y-auto">{ids.map(vm=>{const active=vm.identity.id===selectedId;const high=vm.risk.riskScore>=70||vm.anomaly;return <button key={vm.identity.id} onClick={()=>setSelectedId(vm.identity.id)} className={'w-full border-b border-white/[0.055] px-4 py-4 text-left '+(active?'bg-white/[0.055]':'hover:bg-white/[0.025]')}><div className="flex items-start gap-3"><div className={'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border '+(high?'border-red-400/20 bg-red-400/[0.05] text-red-300':'border-white/10 bg-white/[0.035] text-white/45')}>{high?<ShieldAlert className="h-3.5 w-3.5"/>:<CheckCircle2 className="h-3.5 w-3.5"/>}</div><div className="min-w-0 flex-1"><div className="text-[12px] font-medium text-white/75">{vm.identity.name}</div><div className="mt-1 text-[10px] text-white/25">{vm.decision.outcome.replaceAll('_',' ')}</div></div><ChevronRight className="mt-1 h-3.5 w-3.5 text-white/20"/></div><div className="mt-3 flex items-center justify-between text-[10px] text-white/25"><span>Risk {vm.risk.riskScore}</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3"/>{new Date(vm.audit.timestamp).toLocaleTimeString()}</span></div></button>})}</div></div>
   <div className="min-w-0 space-y-4"><div className="rounded-xl border border-white/[0.08] bg-[#0b0c0f] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[.14em] text-white/25">Decision trace</div><h2 className="mt-1 text-[17px] font-medium">{selected?.identity.name||'Select an identity'}</h2></div>{selected&&<span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/45">{Math.round(selected.decision.confidence*100)}% confidence</span>}</div></div><ExplainabilityPanel viewModel={selected}/><RemediationActions viewModel={selected} onActionCompleted={refresh}/></div>
  </div>
 </div>;
};