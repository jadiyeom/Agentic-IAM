import React from 'react';
import {IdentityViewModel} from '../services/iamApi';
import {FileText,ShieldAlert,CheckCircle2,BrainCircuit} from 'lucide-react';

export const ExplainabilityPanel:React.FC<{viewModel:IdentityViewModel|null}>=({viewModel})=>{
 if(!viewModel)return <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-10 text-center text-[12px] text-white/25">Select an identity to inspect the decision trace.</div>;
 const {identity,audit,policy,risk,decision}=viewModel;
 return <div className="rounded-xl border border-white/[0.08] bg-[#0b0c0f]">
  <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-white/45"/><h3 className="text-[14px] font-medium">Decision reasoning</h3></div><p className="mt-1 text-[11px] text-white/28">Evidence assembled from identity, risk, and policy evaluation.</p></div><span className="font-mono text-[10px] text-white/25">{new Date(audit.timestamp).toLocaleTimeString()}</span></div>
  <div className="grid gap-px bg-white/[0.07] lg:grid-cols-2">
   <div className="bg-[#0b0c0f] p-5"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-white/25"><ShieldAlert className="h-3.5 w-3.5"/>Policy evaluation</div><div className="mt-4 text-[12px] text-white/55">{policy.violations.length?policy.violations.length+' violation(s) detected':'No policy violations detected.'}</div><div className="mt-3 space-y-2">{policy.violations.slice(0,4).map(v=><div key={v.id} className="rounded-md border border-white/[0.07] bg-white/[0.02] p-3"><div className="flex justify-between gap-3"><span className="font-mono text-[10px] text-white/40">{v.policyType}</span><span className="text-[9px] uppercase text-red-300/75">{v.severity}</span></div><p className="mt-1.5 text-[11px] leading-5 text-white/45">{v.description}</p></div>)}</div></div>
   <div className="bg-[#0b0c0f] p-5"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-white/25"><FileText className="h-3.5 w-3.5"/>Natural-language explanation</div><p className="mt-4 text-[13px] leading-6 text-white/48">{audit.explanation}</p><div className="mt-5 border-t border-white/[0.07] pt-4 text-[11px] text-white/28">Identity <span className="text-white/55">{identity.name}</span> · risk <span className="text-white/55">{risk.riskScore}/100</span> · <span className="text-white/55">{Math.round(decision.confidence*100)}% confidence</span></div></div>
  </div>
  <div className="border-t border-white/[0.07] bg-white/[0.015] px-5 py-4"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300/70"/><div><div className="text-[10px] uppercase tracking-[.14em] text-white/25">Final rationale</div><p className="mt-1.5 text-[12px] leading-5 text-white/45">{decision.rationale}</p></div></div></div>
 </div>;
};