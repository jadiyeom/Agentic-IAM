import React,{useEffect,useMemo,useState} from 'react';
import {getEntitlements} from '../services/iamApi';
import {Boxes,Search,ShieldCheck,AlertTriangle,ChevronRight} from 'lucide-react';

interface Entitlement{ id:string; name:string; description:string; sensitivity:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; domains:string[] }

const level=(s:string)=>s==='CRITICAL'?'text-red-300 border-red-400/20 bg-red-400/[0.05]':s==='HIGH'?'text-orange-300 border-orange-400/20 bg-orange-400/[0.05]':s==='MEDIUM'?'text-amber-300 border-amber-400/20 bg-amber-400/[0.05]':'text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.05]';

const Entitlements:React.FC=()=>{
 const [items,setItems]=useState<Entitlement[]>([]); const [query,setQuery]=useState(''); const [selected,setSelected]=useState<Entitlement|null>(null);
 useEffect(()=>{getEntitlements().then(setItems);},[]);
 const filtered=useMemo(()=>items.filter(x=>(x.name+' '+x.description+' '+x.domains.join(' ')).toLowerCase().includes(query.toLowerCase())),[items,query]);
 return <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
   <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-7 sm:flex-row sm:items-end sm:justify-between">
    <div><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.045]"><Boxes className="h-5 w-5 text-white/55"/></div><div><h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-3xl">Entitlements</h1><p className="mt-1.5 text-[13px] text-white/38">Roles and permissions available to identities in the evaluation graph.</p></div></div></div>
    <div className="text-right"><div className="text-[20px] font-semibold">{items.length}</div><div className="text-[10px] uppercase tracking-[.14em] text-white/25">defined roles</div></div>
   </div>
   <div className="border-b border-white/[0.08] py-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search roles, domains, or descriptions..." className="h-10 w-full rounded-md border border-white/[0.1] bg-white/[0.035] pl-9 pr-3 text-[13px] outline-none placeholder:text-white/23 focus:border-white/20"/></div></div>
   <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_330px]">
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c0f]"><div className="grid grid-cols-[1.25fr_1fr_130px_34px] border-b border-white/[0.07] px-5 py-3 text-[10px] uppercase tracking-[.14em] text-white/25"><span>Role</span><span>Domains</span><span>Sensitivity</span><span/></div>
      {filtered.length===0?<div className="p-12 text-center text-[12px] text-white/25">No entitlements match this search.</div>:filtered.map(x=><button key={x.id} onClick={()=>setSelected(x)} className={'grid w-full grid-cols-[1.25fr_1fr_130px_34px] items-center border-b border-white/[0.055] px-5 py-4 text-left transition last:border-0 '+(selected?.id===x.id?'bg-white/[0.055]':'hover:bg-white/[0.025]')}><div><div className="text-[13px] font-medium text-white/80">{x.name}</div><div className="mt-1 line-clamp-1 text-[11px] text-white/28">{x.description}</div></div><div className="flex flex-wrap gap-1">{x.domains.slice(0,3).map(d=><span key={d} className="rounded border border-white/10 bg-white/[0.025] px-1.5 py-0.5 text-[10px] text-white/40">{d}</span>)}</div><span className={'w-fit rounded-md border px-2 py-1 text-[10px] '+level(x.sensitivity)}>{x.sensitivity}</span><ChevronRight className="h-4 w-4 text-white/20"/></button>)}
    </div>
    <div className="rounded-xl border border-white/[0.08] bg-[#0b0c0f] p-5">{selected?<><div className="text-[10px] uppercase tracking-[.14em] text-white/25">Entitlement detail</div><h2 className="mt-3 text-lg font-medium">{selected.name}</h2><p className="mt-3 text-[12px] leading-5 text-white/38">{selected.description}</p><div className="mt-6 border-t border-white/[0.07] pt-5"><div className="text-[10px] uppercase tracking-[.14em] text-white/25">Risk profile</div><div className="mt-3 flex items-center gap-2"><span className={'rounded-md border px-2.5 py-1 text-[11px] '+level(selected.sensitivity)}>{selected.sensitivity}</span>{selected.sensitivity==='CRITICAL'||selected.sensitivity==='HIGH'?<AlertTriangle className="h-4 w-4 text-orange-300"/>:<ShieldCheck className="h-4 w-4 text-emerald-300"/>}</div></div><div className="mt-6 border-t border-white/[0.07] pt-5"><div className="text-[10px] uppercase tracking-[.14em] text-white/25">Domains</div><div className="mt-3 flex flex-wrap gap-2">{selected.domains.map(d=><span key={d} className="rounded-md border border-white/10 bg-white/[0.025] px-2 py-1 text-[11px] text-white/50">{d}</span>)}</div></div></>:<div className="flex min-h-[260px] flex-col items-center justify-center text-center"><Boxes className="h-5 w-5 text-white/20"/><p className="mt-3 text-[12px] text-white/30">Select a role to inspect its access surface.</p></div>}</div>
   </div>
 </div>;
};
export default Entitlements;