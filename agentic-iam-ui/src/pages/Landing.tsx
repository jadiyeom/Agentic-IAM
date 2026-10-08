import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Database,
  Eye,
  GitBranch,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const plans = [
  {
    name: 'Demo',
    price: '$0',
    note: 'For evaluating TrustLens',
    features: ['Live security console', 'Simulated identity events', 'Risk & policy analysis', 'Explainable decisions'],
    cta: 'Launch demo',
    featured: false,
  },
  {
    name: 'Pilot',
    price: '$299',
    note: 'per month · early access',
    features: ['Up to 500 identities', 'Human + AI-agent identities', 'Continuous risk evaluation', 'Policy & SoD detection', 'Remediation workflows', 'Audit-ready decision trail'],
    cta: 'Start a pilot',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    note: 'For production deployments',
    features: ['Unlimited identities', 'Custom integrations', 'SSO / enterprise controls', 'Dedicated deployment options', 'Security & compliance support', 'Custom retention and SLAs'],
    cta: 'Talk to us',
    featured: false,
  },
];

export const Landing: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <ShieldCheck className="h-6 w-6 text-cyan-300" />
          TrustLens
        </a>
        <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#how-it-works" className="hover:text-white">How it works</a>
          <a href="#use-cases" className="hover:text-white">Use cases</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </div>
        <Link to="/identities" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
          Open live demo
        </Link>
      </div>
    </nav>

    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.12),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pt-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-300">
              <Activity className="h-3.5 w-3.5" /> Continuous identity security for humans and AI agents
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              Know what your agents can access.
              <span className="text-cyan-300"> Before they use it.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              TrustLens continuously evaluates identities, entitlements, risk and policy — then explains the decision and helps security teams remediate dangerous access.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/identities" className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-200">
                Explore the live console <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#product" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 font-semibold hover:border-slate-500">
                See how it works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>Human identities</span><span>AI agents</span><span>Least privilege</span><span>Explainable decisions</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/20">
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">TRUSTLENS SECURITY CONSOLE</span>
              <span className="flex items-center gap-1.5 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Monitoring</span>
            </div>
            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div><div className="text-xs text-slate-500">HIGH-RISK IDENTITY</div><div className="mt-1 font-semibold">deployment-intern</div></div>
                <span className="rounded-full bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">Risk 91</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-950 p-3"><div className="text-xs text-slate-500">New entitlement</div><div className="mt-1 font-mono text-red-300">production-db.admin</div></div>
                <div className="rounded-xl bg-slate-950 p-3"><div className="text-xs text-slate-500">Decision</div><div className="mt-1 font-mono text-amber-300">REVOKE</div></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {['Identity context collected', 'Risk score calculated', 'Least-privilege policy violated', 'Remediation recommended'].map((item, i) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/10 text-xs text-cyan-300">{i + 1}</span>
                  <span className="text-slate-300">{item}</span><Check className="ml-auto h-4 w-4 text-emerald-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y border-slate-800 bg-slate-900/35">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">One security layer</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Identity security built for an agentic world.</h2>
            <p className="mt-4 text-slate-400">Traditional IAM answers who can access what. TrustLens adds the missing context: why the access changed, how risky it is, whether policy allows it, and what should happen next.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Bot />} title="Agent-aware identity" text="Treat autonomous agents as first-class identities with roles, entitlements and behavioral context." />
            <Feature icon={<Eye />} title="Continuous risk" text="Score access changes using identity context, privilege sensitivity, role alignment and anomaly signals." />
            <Feature icon={<LockKeyhole />} title="Policy intelligence" text="Detect least-privilege violations, segregation-of-duties conflicts and role eligibility problems." />
            <Feature icon={<Sparkles />} title="Explainable decisions" text="Turn raw security signals into an operator-friendly rationale with confidence and clear next actions." />
            <Feature icon={<Zap />} title="Remediation loop" text="Move from detection to review, downgrade or revocation without losing the audit trail." />
            <Feature icon={<GitBranch />} title="Decision history" text="Keep the reasoning chain visible so security teams can understand what changed and why." />
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">From identity change to defensible action.</h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-5">
            {[
              ['01', 'Observe', 'Ingest identity, role, entitlement and behavioral context.', <Network />],
              ['02', 'Evaluate risk', 'Calculate contextual risk instead of relying on a static role alone.', <Activity />],
              ['03', 'Check policy', 'Test least privilege, SoD and eligibility constraints.', <LockKeyhole />],
              ['04', 'Decide', 'Fuse signals into an explainable security decision.', <Sparkles />],
              ['05', 'Remediate', 'Review or revoke access and preserve the decision trail.', <ShieldCheck />],
            ].map(([number, title, text, icon]) => (
              <div key={String(number)} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between text-cyan-300"><span className="text-xs font-mono">{number}</span>{icon}</div>
                <h3 className="mt-6 font-semibold">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{String(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="border-y border-slate-800 bg-slate-900/35">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Built for the access problems that get harder with AI</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Catch privilege drift before it becomes an incident.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <UseCase icon={<Bot />} title="AI agents & copilots" text="Monitor the permissions autonomous agents accumulate as they call tools, APIs and internal systems." />
            <UseCase icon={<Database />} title="Production access" text="Flag sudden elevation into sensitive databases, cloud accounts and infrastructure." />
            <UseCase icon={<GitBranch />} title="Developer & CI/CD identities" text="Detect risky access changes across service accounts, pipelines and engineering workflows." />
            <UseCase icon={<ShieldCheck />} title="Access reviews" text="Give reviewers the context behind a decision instead of another spreadsheet of entitlements." />
          </div>
          <div className="mt-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-7">
            <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Signature scenario</div>
            <div className="mt-3 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div><div className="text-sm text-slate-500">BEFORE</div><div className="mt-1 font-mono text-slate-300">intern → staging.read</div></div>
              <ChevronRight className="hidden h-5 w-5 text-cyan-300 md:block" />
              <div><div className="text-sm text-slate-500">SUDDEN CHANGE</div><div className="mt-1 font-mono text-red-300">intern → production-db.admin</div></div>
              <div><div className="text-sm text-slate-500">TRUSTLENS</div><div className="mt-1 font-mono text-amber-300">91 risk → revoke / review</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Designed for security teams</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">See the reasoning, not just the alert.</h2>
            <p className="mt-4 text-slate-400">Every flagged identity can be traced through identity context, risk, policy, decision and remediation. That makes TrustLens a security decision layer — not another noisy alert inbox.</p>
            <ul className="mt-7 space-y-3 text-sm text-slate-300">
              {['Contextual 0–100 risk scoring', 'Policy and entitlement violations', 'Human-readable rationale and confidence', 'Review, revoke and remediation actions', 'Audit trail for every decision'].map(x => <li key={x} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 text-cyan-300" />{x}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="text-xs text-slate-500">DECISION TRACE</div>
            <div className="mt-5 space-y-3">
              {[
                ['Identity', 'deployment-intern', 'cyan'],
                ['Risk', '91 / 100 · Critical', 'red'],
                ['Policy', 'Least privilege violated', 'amber'],
                ['Decision', 'RECOMMEND_REVOCATION', 'amber'],
                ['Action', 'Revoke production-db.admin', 'emerald'],
              ].map(([a,b,c]) => (
                <div key={a} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="text-sm text-slate-500">{a}</span>
                  <span className={c === 'red' ? 'text-red-300' : c === 'amber' ? 'text-amber-300' : c === 'emerald' ? 'text-emerald-300' : 'text-cyan-300'}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-800 bg-slate-900/35">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Start with the demo. Scale when the risk is real.</h2>
            <p className="mt-4 text-slate-400">Simple plans for evaluation, pilots and production. Pilot and Enterprise pricing is positioned for early access and can be adjusted as the product matures.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map(plan => (
              <div key={plan.name} className={plan.featured ? 'rounded-3xl border border-cyan-300/40 bg-slate-950 p-7 shadow-xl shadow-cyan-950/20' : 'rounded-3xl border border-slate-800 bg-slate-950/60 p-7'}>
                {plan.featured && <div className="mb-5 inline-flex rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950">MOST POPULAR</div>}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 text-4xl font-semibold">{plan.price}{plan.price !== 'Custom' && <span className="text-base font-normal text-slate-500">/mo</span>}</div>
                <p className="mt-2 text-sm text-slate-500">{plan.note}</p>
                <ul className="mt-7 space-y-3 text-sm text-slate-300">{plan.features.map(x => <li key={x} className="flex gap-3"><Check className="h-4 w-4 shrink-0 text-cyan-300" />{x}</li>)}</ul>
                <Link to="/identities" className={plan.featured ? 'mt-8 flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950' : 'mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold'}>
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-600">Pricing shown is an early-access positioning for the demo product and is not a live billing commitment.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent px-7 py-12 text-center md:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Try it yourself</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">See an identity go from normal to dangerous in seconds.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">Launch the console and simulate the production-database privilege escalation. Watch every agent evaluate the event and produce a defensible decision.</p>
          <Link to="/identities" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-slate-950">
            Launch live demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="font-semibold text-slate-300">TrustLens</div>
          <div>Agentic identity security · Risk · Policy · Decision · Remediation</div>
          <div>© 2026 TrustLens</div>
        </div>
      </footer>
    </main>
  </div>
);

function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700"><div className="h-5 w-5 text-cyan-300">{icon}</div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>;
}

function UseCase({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">{icon}</div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>;
}
