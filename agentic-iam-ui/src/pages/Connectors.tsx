import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, CheckCircle2, CircleAlert, Clock3, Database, ExternalLink, LoaderCircle, Plug, RefreshCw, ShieldCheck, Users, Workflow } from 'lucide-react';
import { Card, CardHeader, PageHeader, Skeleton, StatCard } from '../components/ui';

type Connector = {
  id: string; name: string; category: string; description: string; configured: boolean;
  missingEnvironment: string[]; capabilities: string[]; setupUrl: string;
};
type Identity = { id:string; source:string; displayName:string; email?:string; status?:string; kind:string; department?:string; roles:string[]; groups:string[]; rawId:string; updatedAt?:string };
type Resource = { id:string; source:string; name:string; kind:string; description?:string; risk?:string; members?:number };
type Event = { id:string; source:string; timestamp?:string; actor?:string; action:string; target?:string; severity:string; summary:string };
type Snapshot = { connectorId:string; provider:string; syncedAt:string; counts:{identities:number;resources:number;events:number}; identities:Identity[]; resources:Resource[]; events:Event[]; warnings:string[] };
type SnapshotSummary = { connectorId:string; provider:string; syncedAt:string; counts:{identities:number;resources:number;events:number}; warnings:string[] };

const categoryLabel:Record<string,string> = {'identity-provider':'Identity provider','cloud-identity':'Cloud identity','developer-access':'Developer access'};
const when = (value?:string) => value ? new Date(value).toLocaleString() : 'Time unavailable';

const Connectors: React.FC = () => {
  const [connectors,setConnectors]=useState<Connector[]>([]);
  const [summaries,setSummaries]=useState<SnapshotSummary[]>([]);
  const [snapshots,setSnapshots]=useState<Record<string,Snapshot>>({});
  const [busy,setBusy]=useState<Record<string,boolean>>({});
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState<'identities'|'resources'|'events'>('identities');
  const [selectedId,setSelectedId]=useState('');

  const refresh=useCallback(async()=>{
    const [list,summary]=await Promise.all([
      axios.get<Connector[]>('/api/connectors'),
      axios.get<SnapshotSummary[]>('/api/connectors/snapshots')
    ]);
    setConnectors(list.data); setSummaries(summary.data);
  },[]);

  useEffect(()=>{refresh().catch(e=>setErrors({page:e?.message||'Could not load connector registry'})).finally(()=>setLoading(false));},[refresh]);

  const sync=async(id:string)=>{
    setBusy(s=>({...s,[id]:true}));setErrors(s=>({...s,[id]:''}));
    try{
      const res=await axios.post<Snapshot>('/api/connectors/'+encodeURIComponent(id)+'/sync',{}, {timeout:120000});
      setSnapshots(s=>({...s,[id]:res.data}));setSelectedId(id);
      await refresh();
    }catch(e:any){
      const message=e?.response?.data?.error||e?.message||'Sync failed';
      setErrors(s=>({...s,[id]:message}));
    }finally{setBusy(s=>({...s,[id]:false}));}
  };

  const loadSnapshot=async(id:string)=>{
    try{const res=await axios.get<Snapshot>('/api/connectors/'+encodeURIComponent(id)+'/data');setSnapshots(s=>({...s,[id]:res.data}));setSelectedId(id);}
    catch(e:any){setErrors(s=>({...s,[id]:e?.response?.data?.error||'No synced data yet'}));}
  };

  const currentSummary=(id:string)=>summaries.find(s=>s.connectorId===id);
  const currentSnapshot=(id:string)=>snapshots[id];
  const selected=selectedId || Object.keys(snapshots).find(id=>snapshots[id]) || '';
  const data=selected?snapshots[selected]:undefined;
  const rows: Array<Identity|Resource|Event> = !data?[]:activeTab==='identities'?data.identities:activeTab==='resources'?data.resources:data.events;

  return <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
    <div className="animate-rise">
      <PageHeader eyebrow="Workspace / Integrations" title="Live connectors" description="Connect identity and access sources, sync a live snapshot, and inspect identities, resources and audit activity. Credentials stay on the backend." icon={<Plug className="h-5 w-5"/>} actions={<button onClick={()=>refresh().catch(()=>undefined)} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3.5 text-[12px] text-white/70 hover:border-white/20 hover:text-white"><RefreshCw className="h-3.5 w-3.5"/>Refresh</button>}/>
      {errors.page&&<div role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-[12px] text-red-200">{errors.page}</div>}
      <div className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
        <StatCard label="Available sources" value={loading?'–':connectors.length} detail="Provider adapters" icon={<Plug/>}/>
        <StatCard label="Configured" value={loading?'–':connectors.filter(c=>c.configured).length} detail="Credentials detected" icon={<ShieldCheck/>} tone="lime"/>
        <StatCard label="Synced identities" value={summaries.reduce((n,s)=>n+s.counts.identities,0)} detail="Across completed snapshots" icon={<Users/>}/>
        <StatCard label="Audit events" value={summaries.reduce((n,s)=>n+s.counts.events,0)} detail="Included in latest snapshots" icon={<Activity/>}/>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,.9fr)]">
        <section aria-labelledby="connector-list-title">
          <div className="mb-3 flex items-center justify-between"><h2 id="connector-list-title" className="text-sm font-medium text-white">Sources</h2><span className="text-[11px] text-white/40">Read-only sync</span></div>
          <div className="grid gap-3">
            {loading?Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-40"/>):connectors.map(connector=>{
              const summary=currentSummary(connector.id);const snapshot=currentSnapshot(connector.id);const isBusy=!!busy[connector.id];
              return <article key={connector.id} className="rounded-2xl border border-white/[0.08] bg-[#0d0e10] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><h3 className="text-[14px] font-medium text-white">{connector.name}</h3>{connector.configured?<span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] text-emerald-200"><CheckCircle2 className="h-3 w-3"/>Configured</span>:<span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/[0.05] px-2 py-0.5 text-[10px] text-amber-100"><CircleAlert className="h-3 w-3"/>Needs setup</span>}</div>
                    <p className="mt-1 text-[11px] text-white/40">{categoryLabel[connector.category]||connector.category}</p>
                  </div>
                  <a href={connector.setupUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-[#b7ff49]">Setup guide <ExternalLink className="h-3 w-3"/></a>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-white/60">{connector.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{connector.capabilities.map(cap=><span key={cap} className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 font-mono text-[10px] text-white/55">{cap}</span>)}</div>
                {!connector.configured&&<div className="mt-3 rounded-lg border border-white/[0.06] bg-black/20 p-2.5"><p className="text-[10px] text-white/45">Missing backend environment variables</p><div className="mt-1 flex flex-wrap gap-1">{connector.missingEnvironment.map(key=><code key={key} className="rounded bg-white/[0.05] px-1.5 py-1 text-[10px] text-amber-100/80">{key}</code>)}</div></div>}
                {summary&&<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/45"><span className="inline-flex items-center gap-1"><Database className="h-3 w-3"/>{summary.counts.identities} identities</span><span>{summary.counts.resources} resources</span><span>{summary.counts.events} events</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3"/>{when(summary.syncedAt)}</span></div>}
                {errors[connector.id]&&<p role="alert" className="mt-3 text-[11px] text-red-200">{errors[connector.id]}</p>}
                {snapshot?.warnings?.length>0&&<p className="mt-2 text-[11px] text-amber-100/80">{snapshot.warnings.length} data source warning(s). Inspect the snapshot details.</p>}
                <div className="mt-4 flex gap-2">
                  <button disabled={!connector.configured||isBusy} onClick={()=>sync(connector.id)} className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#b7ff49] px-4 text-[12px] font-semibold text-[#08090b] transition hover:bg-[#c8ff79] disabled:cursor-not-allowed disabled:opacity-40">{isBusy?<LoaderCircle className="h-3.5 w-3.5 animate-spin"/>:<RefreshCw className="h-3.5 w-3.5"/>}{isBusy?'Syncing…':'Sync now'}</button>
                  <button onClick={()=>loadSnapshot(connector.id)} disabled={!summary} className="h-9 rounded-full border border-white/10 px-4 text-[12px] text-white/65 hover:border-white/20 hover:text-white disabled:opacity-30">View data</button>
                </div>
              </article>;
            })}
          </div>
        </section>

        <section aria-labelledby="snapshot-title" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="snapshot-title" className="text-sm font-medium text-white">Synced data</h2>{data&&<span className="text-[10px] text-white/40">{data.provider}</span>}</div>
          {!data?<Card><div className="flex min-h-52 flex-col items-center justify-center px-5 text-center"><Workflow className="h-7 w-7 text-white/25"/><p className="mt-3 text-[13px] text-white/75">No snapshot selected</p><p className="mt-1 max-w-xs text-[11px] leading-5 text-white/45">Configure a provider, run Sync now, then inspect the normalized records here.</p></div></Card>:<Card>
            <CardHeader icon={<Database className="h-4 w-4"/>} title={data.provider} subtitle={'Synced '+when(data.syncedAt)}/>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
              {([['Identities',data.counts.identities],['Resources',data.counts.resources],['Events',data.counts.events]] as const).map(([label,value])=><div key={label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5"><div className="text-[10px] text-white/45">{label}</div><div className="mt-1 text-xl font-semibold tabular-nums">{value}</div></div>)}
            </div>
            <div className="flex border-y border-white/[0.07] px-3">
              {(['identities','resources','events'] as const).map(tab=><button key={tab} onClick={()=>setActiveTab(tab)} className={'flex-1 border-b-2 px-2 py-3 text-[11px] capitalize '+(activeTab===tab?'border-[#b7ff49] text-white':'border-transparent text-white/45 hover:text-white/80')}>{tab}</button>)}
            </div>
            {data.warnings.length>0&&<div className="mx-4 mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3"><p className="text-[11px] font-medium text-amber-100">Partial sync warnings</p><ul className="mt-1 list-disc space-y-1 pl-4 text-[10px] leading-4 text-amber-100/70">{data.warnings.map((warning,i)=><li key={i}>{warning}</li>)}</ul></div>}
            <div className="max-h-[620px] overflow-auto">
              {rows.length===0?<div className="p-8 text-center text-[12px] text-white/40">No records returned for this category.</div>:<ul className="divide-y divide-white/[0.06]">
                {rows.slice(0,250).map((row:any)=><li key={row.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3"><p className="break-words text-[12px] font-medium text-white/85">{row.displayName||row.name||row.summary||row.action||'Record'}</p><span className="shrink-0 rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[9px] uppercase text-white/45">{row.kind||row.severity||activeTab.slice(0,-1)}</span></div>
                  {row.email&&<p className="mt-1 break-all text-[10px] text-white/50">{row.email}</p>}
                  {row.description&&<p className="mt-1 text-[10px] leading-4 text-white/45">{row.description}</p>}
                  {(row.actor||row.target||row.timestamp)&&<p className="mt-1 text-[10px] leading-4 text-white/40">{[row.actor,row.target,when(row.timestamp)].filter(Boolean).join(' · ')}</p>}
                  {row.department&&<p className="mt-1 text-[10px] text-white/40">{row.department}</p>}
                </li>)}
              </ul>}
              {rows.length>250&&<p className="border-t border-white/[0.07] p-3 text-center text-[10px] text-white/40">Showing 250 of {rows.length} records.</p>}
            </div>
          </Card>}
        </section>
      </div>
      <p className="mt-5 text-[11px] leading-5 text-white/35">Syncs are read-only. Snapshots currently live in backend process memory and are cleared when the service restarts or a serverless instance changes. Configure a durable database and scheduled incremental sync before using this as a production source of truth.</p>
    </div>
  </div>;
};
export default Connectors;
