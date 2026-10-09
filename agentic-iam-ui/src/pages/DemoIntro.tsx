import React from 'react';
import { ArrowRight, CheckCircle2, Fingerprint, ShieldCheck, Sparkles, GitBranch, Database, FlaskConical, LockKeyhole, Users, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem, Spotlight } from '../components/motion';

const steps = [
  ['Observe', 'See identity and entitlement context.', Fingerprint],
  ['Assess', 'Surface privilege, sensitivity, and behavior risk.', ShieldCheck],
  ['Decide', 'Follow the decision path and evidence.', Sparkles],
  ['Act', 'Review or execute a controlled remediation.', GitBranch],
];

export const DemoIntro: React.FC = () => {
  const navigate = useNavigate();

  const enterSyntheticDemo = () => {
    localStorage.setItem('steerpast-iam-demo-mode', 'synthetic');
    localStorage.setItem('steerpast-iam-auth', 'true');
    navigate('/identities');
  };

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-[#08090b] text-white">
      <div aria-hidden="true" className="aurora" />
      <div aria-hidden="true" className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <main className="relative mx-auto max-w-[1040px] px-5 py-12 sm:py-16 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img src="/steerpast-logo.png" alt="Steerpast" className="h-14 w-14 rounded-[16px] object-cover shadow-[0_0_70px_rgba(183,255,73,.10)]" />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Steerpast IAM · Interactive demo</div>
          <h1 className="mt-5 font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-6xl">How would you like to explore?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/65">Choose a safe, synthetic walkthrough or connect an identity source to explore a limited sample from your own environment.</p>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Reveal className="h-full">
            <section className="flex h-full flex-col rounded-[22px] border border-[#b7ff49]/25 bg-[#b7ff49]/[0.045] p-6 shadow-[0_0_70px_rgba(183,255,73,.045)] sm:p-8">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#b7ff49]/20 bg-[#b7ff49]/[0.06] px-3 py-1.5 text-[10px] font-medium text-[#d5ff9d]"><FlaskConical className="h-3.5 w-3.5" />No setup required</span>
                <Database className="h-5 w-5 text-[#b7ff49]" />
              </div>
              <h2 className="mt-6 text-2xl font-medium tracking-[-0.035em]">Explore with synthetic data</h2>
              <p className="mt-3 text-[13px] leading-6 text-white/60">Jump straight into a realistic identity-security scenario. No sign-in to an identity provider and no tenant access needed.</p>
              <ul className="mt-5 space-y-3 text-[12px] leading-5 text-white/65">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b7ff49]" />Pre-populated sample identities and audit events</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b7ff49]" />Explore risk, policy, decisions, and remediation</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b7ff49]" />All records are synthetic—not from a real tenant</li>
              </ul>
              <button type="button" onClick={enterSyntheticDemo} className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#b7ff49] px-5 text-[13px] font-semibold text-[#08090a] transition hover:bg-[#d0ff88]">
                Explore synthetic demo <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <section className="flex h-full flex-col rounded-[22px] border border-white/[0.1] bg-[#101113] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium text-white/65"><LockKeyhole className="h-3.5 w-3.5" />Connect your environment</span>
                <Users className="h-5 w-5 text-white/65" />
              </div>
              <h2 className="mt-6 text-2xl font-medium tracking-[-0.035em]">Work with live sources</h2>
              <p className="mt-3 text-[13px] leading-6 text-white/60">Sign in to Steerpast, authorize an identity provider, and choose a sandbox/test tenant or live environment before syncing.</p>
              <ul className="mt-5 space-y-3 text-[12px] leading-5 text-white/65">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />Connect Microsoft, Google, and supported providers</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />Demo sync is limited to at most 10 accounts</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />Read-only access; review permissions before consent</li>
              </ul>
              <div className="mt-7 rounded-xl border border-amber-200/15 bg-amber-200/[0.035] p-3 text-[11px] leading-5 text-amber-100/75">
                Live connections are not enabled in this milestone. Your credentials are not requested or stored on this screen.
              </div>
              <button type="button" disabled className="mt-4 inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-[13px] font-medium text-white/35" aria-describedby="live-setup-status">
                <LogIn className="h-4 w-4" />Live source setup · coming next
              </button>
              <p id="live-setup-status" className="mt-2 text-[10px] text-white/35">Authentication and secure per-workspace credential storage will be implemented before live access is enabled.</p>
            </section>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-8 rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">What the synthetic demo covers</div>
          <Stagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text, Icon], i) => {
              const I = Icon as React.ElementType;
              return <StaggerItem key={title as string}><div className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/60"><I className="h-4 w-4" /></span>
                <div><div className="text-[13px] font-medium">{String(i + 1).padStart(2, '0')} · {title as string}</div><p className="mt-1 text-[11px] leading-5 text-white/50">{text as string}</p></div>
              </div></StaggerItem>;
            })}
          </Stagger>
        </Reveal>

        <div className="mt-8 text-center"><Link to="/" className="text-[12px] text-white/50 transition hover:text-white">← Back to Steerpast</Link></div>
      </main>
    </div>
  );
};
