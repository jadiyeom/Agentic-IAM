import React from 'react';
interface Props{score:number;anomaly:boolean}
export const RiskBadge:React.FC<Props>=({score,anomaly})=>{
 const cls=score>=80?'border-red-400/25 bg-red-400/[0.06] text-red-300':score>=60?'border-orange-400/25 bg-orange-400/[0.06] text-orange-300':score>=40?'border-amber-400/25 bg-amber-400/[0.06] text-amber-300':'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300';
 return <div className="flex items-center gap-2"><span className={'rounded-md border px-2 py-1 text-[10px] font-medium '+cls}>{score}/100</span>{anomaly&&<span className="rounded-md border border-red-400/20 bg-red-400/[0.04] px-2 py-1 text-[9px] uppercase tracking-wide text-red-300">Anomaly</span>}</div>;
};