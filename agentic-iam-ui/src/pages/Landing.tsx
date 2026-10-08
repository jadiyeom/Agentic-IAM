import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ShieldCheck, Zap, Activity } from 'lucide-react';

export const Landing: React.FC = () => (
  <div className="min-h-screen bg-[#070a0f] text-slate-100">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="h-6 w-6 text-cyan-300"/>TrustLens</div>
      <Link to="/identities" onClick={() => localStorage.setItem('trustlens-iam-auth', 'true')} className="rounded-xl border border-white/[.10] px-4 py-2 text-sm hover:border-cyan-300">Open live demo</Link>
    </nav>
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-300"><Activity className="h-3.5 w-3.5"/>Continuous identity security</div>
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">Know what your agents can access.<span className="text-cyan-300"> Before they use it.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">TrustLens continuously evaluates human and AI-agent identities for risky access, policy violations, and privilege drift — then explains what happened and what to do next.</p>
          <div className="mt-9"><Link to="/identities" onClick={() => localStorage.setItem('trustlens-iam-auth', 'true')} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Explore the security console <ArrowRight className="h-4 w-4"/></Link></div>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Feature icon={<Bot/>} title="Agent-aware identity" text="Treat autonomous agents as first-class identities with roles, entitlements, and behavioral context."/>
          <Feature icon={<ShieldCheck/>} title="Explainable decisions" text="Combine deterministic risk and policy evaluation with natural-language reasoning for security operators."/>
          <Feature icon={<Zap/>} title="Remediation loop" text="Move from detection to review or access revocation with an auditable decision trail."/>
        </div>
      </section>
      <section className="border-y border-white/[.07] bg-[#0b1017]/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">The demo scenario</p><h2 className="mt-3 text-3xl font-semibold">An intern suddenly receives production database admin access.</h2><p className="mt-4 text-slate-400">See TrustLens detect the privilege change, evaluate policy and risk, explain the blast radius, and recommend remediation.</p></div>
          <div className="rounded-3xl border border-white/[.07] bg-slate-950 p-6 font-mono text-sm"><div className="text-slate-500">identity</div><div className="mt-1 text-cyan-300">deployment-intern</div><div className="mt-4 text-slate-500">new entitlement</div><div className="mt-1 text-red-300">production-db.admin</div><div className="mt-4 text-slate-500">decision</div><div className="mt-1 text-amber-300">RECOMMEND_REVOCATION</div></div>
        </div>
      </section>
    </main>
  </div>
);

function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div className="rounded-3xl border border-white/[.07] bg-[#0b1017] p-6"><div className="h-5 w-5 text-cyan-300">{icon}</div><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>;
}
