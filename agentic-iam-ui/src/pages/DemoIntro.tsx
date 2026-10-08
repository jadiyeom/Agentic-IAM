import React from 'react';
import { ArrowRight, CheckCircle2, Fingerprint, ShieldCheck, Sparkles, GitBranch, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem, Spotlight, Magnetic } from '../components/motion';

const steps = [
  ['Observe', 'See identity and entitlement context.', Fingerprint],
  ['Assess', 'Surface privilege, sensitivity, and behavior risk.', ShieldCheck],
  ['Decide', 'Follow the decision path and evidence.', Sparkles],
  ['Act', 'Review or execute a controlled remediation.', GitBranch],
];

export const DemoIntro: React.FC = () => (
  <div className="grain relative min-h-screen overflow-hidden bg-[#08090b] text-white">
    <div aria-hidden="true" className="aurora" />
    <div aria-hidden="true" className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
    <main className="relative mx-auto max-w-[1040px] px-5 py-16 sm:py-24 lg:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-7 flex justify-center">
          <img src="/steerpast-logo.png" alt="Steerpast" className="h-16 w-16 rounded-[18px] object-cover shadow-[0_0_70px_rgba(183,255,73,.10)]" />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Steerpast IAM · Interactive demo</div>
        <h1 className="mt-5 font-serif text-5xl font-medium leading-[.98] tracking-[-0.045em] sm:text-6xl">See an access decision from signal to action.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-7 text-white/70">Explore a seeded identity dataset and follow a realistic privileged-access scenario. No production identity provider connection is required.</p>
      </Reveal>

      <Stagger className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" delay={0.15}>
        {steps.map(([title,text,Icon], i) => {
          const I = Icon as React.ElementType;
          return <StaggerItem key={title as string}><Spotlight className="h-full rounded-[18px] border border-white/[0.08] bg-[#101113] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
            <div className="flex items-center justify-between"><span className="font-mono text-[11px] text-white/70">0{i+1}</span><span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/55"><I className="h-4 w-4" /></span></div>
            <h2 className="mt-7 text-[15px] font-medium">{title as string}</h2>
            <p className="mt-2 text-[13px] leading-6 text-white/60">{text as string}</p>
          </Spotlight></StaggerItem>;
        })}
      </Stagger>

      <Reveal delay={0.25} className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[22px] border border-[#b7ff49]/20 bg-[#b7ff49]/[0.035] p-7 shadow-[0_0_80px_rgba(183,255,73,.05)]">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-[#b7ff49]" /><span className="text-[13px] font-medium">Demo scenario</span></div>
          <h2 className="mt-5 text-2xl font-medium tracking-[-0.03em]">An intern gets production database admin access.</h2>
          <p className="mt-4 text-[13px] leading-6 text-white/60">Steerpast connects the identity, risk, policy conflict, model-assisted decision, and remediation recommendation into one inspectable trace.</p>
          <Magnetic><Link to="/identities" onClick={() => localStorage.setItem('steerpast-iam-auth','true')} className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-[#b7ff49] px-4 text-[12px] font-semibold text-[#08090a] transition hover:-translate-y-0.5 hover:bg-[#d0ff88]">Enter the workspace <ArrowRight className="h-3.5 w-3.5" /></Link></Magnetic>
        </div>
        <div className="rounded-[22px] border border-white/[0.08] bg-[#101113] p-7">
          <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-white/65" /><span className="text-[13px] font-medium">What to look for</span></div>
          <ul className="mt-5 space-y-3 text-[13px] leading-6 text-white/65">
            <li>Identity type, owner, role, and entitlement context.</li>
            <li>Risk severity and policy conflict signals.</li>
            <li>The DecisionAgent outcome and rationale.</li>
            <li>Operator-controlled remediation and audit evidence.</li>
            <li className="text-white/70">Press <kbd className="rounded border border-white/15 px-1 font-mono text-[11px]">Run the intern scenario</kbd> to watch the agents react live, or <kbd className="rounded border border-white/15 px-1 font-mono text-[11px]">⌘K</kbd> to jump anywhere.</li>
          </ul>
        </div>
      </Reveal>

      <div className="mt-8 text-center"><Link to="/" className="text-[12px] text-white/55 transition hover:text-white">← Back to Steerpast</Link></div>
    </main>
  </div>
);
