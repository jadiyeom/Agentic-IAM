import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CountUp, EASE_OUT, Magnetic, Reveal, ScrollProgress, Spotlight, Stagger, StaggerItem, TiltIn, rise, stagger } from '../components/motion';
import { Menu, X, ArrowRight, Bot, ShieldCheck, Activity, Lock, GitBranch, Eye, AlertTriangle, Check, ChevronRight, Database, KeyRound, Sparkles, Fingerprint, Network, ScanSearch, Plus, Cpu, ServerCog, ArrowUpRight } from 'lucide-react';

const demo = () => {}; // Demo mode is selected on /demo; do not create a workspace session from the landing page.

const contactHref = '/company#contact';

const sections = [
  ['product', 'Product'],
  ['how-it-works', 'How it works'],
  ['scenario', 'Scenario'],
  ['claude', 'Claude'],
  ['security', 'Security'],
  ['pricing', 'Pricing'],
  ['faq', 'FAQ'],
] as const;

const SteerpastMark = ({className='h-7 w-7'}:{className?:string}) => (
  <img src="/steerpast-logo.png" alt="" aria-hidden="true" className={`shrink-0 rounded-[9px] object-cover ${className}`} />
);

const faqItems = [
  ['Where does Claude fit?', 'Claude can power the model-backed DecisionAgent. Deterministic risk and policy signals are collected first, the model returns an outcome, rationale, and confidence, and the response is validated before entering remediation.'],
  ['What is Steerpast IAM?', 'Steerpast IAM is an identity security control plane for human, service, and AI-agent identities. It connects identity context, risk, policy evaluation, decisioning, remediation, and audit evidence in one workflow.'],
  ['Does Steerpast IAM treat AI agents differently from users?', 'Agents are first-class identities. Steerpast tracks their owner, role, entitlements, environment, and behavior so autonomous access can be evaluated with the same accountability as human access.'],
  ['How does a security decision get made?', 'IdentityAgent gathers context, RiskAgent evaluates risk, PolicyAgent checks constraints, and DecisionAgent synthesizes the result. The system can then recommend remediation while retaining the evidence behind the decision.'],
  ['Can humans review or override a recommendation?', 'Yes. Sensitive remediation is designed around human authority. Operators can inspect the evidence, send an item for review, revoke access, or override a decision with an auditable reason.'],
  ['Is there a demo without setting up an integration?', 'Yes. The live demo uses a realistic identity and entitlement dataset so you can explore the workflow without connecting a production identity provider.'],
  ['How much does it cost?', 'The Pilot plan starts at $29/month for teams validating the workflow. Growth is $99/month, and Enterprise is custom for production deployments and governance requirements.'],
  ['Can I talk to the Steerpast team?', 'Absolutely. Use the Contact us link and your email client will open a message to the Steerpast team.']
];

export const Landing: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState('product');
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const ids = sections.map(([id]) => id);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: [0.05, 0.2, 0.5] }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page grain min-h-screen bg-[#08090a] text-[#eeeae0] selection:bg-[#b7ff49]/20">
      <ScrollProgress />
      <a href="#main" className="skip-link">Skip to content</a>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${scrolled ? 'border-white/[0.08] bg-[#08090a]/85' : 'border-transparent bg-[#08090a]/40'}`}>
        <nav className="mx-auto flex h-[68px] max-w-[1160px] items-center justify-between px-5 lg:px-8">
          <a href="#top" aria-label="Steerpast IAM home" className="flex items-center gap-2.5 text-[14px] font-semibold tracking-[-0.02em]">
            <SteerpastMark className="h-8 w-8" />
            Steerpast <span className="text-white/50">IAM</span>
          </a>
          <div className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.025] p-1 text-[12px] lg:flex">
            {sections.map(([id,label]) => (
              <a key={id} href={`#${id}`} aria-current={activeSection===id ? 'true' : undefined} className={`rounded-full px-3 py-1.5 transition hover:bg-white/[0.07] hover:text-white ${activeSection===id ? 'bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.05)]' : 'text-white/65'}`}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/demo" onClick={demo} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#eeeae0] px-4 text-[12px] font-medium text-[#08090a] transition hover:bg-white">
              View demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button type="button" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-white/20 hover:text-white lg:hidden">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div id="mobile-menu" className="animate-rise border-t border-white/[0.08] bg-[#08090a] lg:hidden">
            <div className="mx-auto grid max-w-[1160px] gap-1 px-5 py-4">
              {sections.map(([id,label]) => (
                <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className={`rounded-xl px-4 py-3 text-[15px] transition hover:bg-white/[0.05] ${activeSection===id ? 'bg-white/[0.06] text-white' : 'text-white/70'}`}>{label}</a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-4">
                <a href="/claude" className="rounded-xl border border-white/10 px-4 py-3 text-center text-[13px] text-white/70">Claude architecture</a>
                <a href={contactHref} className="rounded-xl border border-white/10 px-4 py-3 text-center text-[13px] text-white/70">Contact us</a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <section id="top" className="relative -mt-[68px] overflow-hidden pt-[68px]">
          <div aria-hidden="true" className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[720px]" />
          <div aria-hidden="true" className="aurora" />
          <div className="relative mx-auto max-w-[1000px] px-5 pb-28 pt-20 text-center lg:pt-28">
            <motion.div variants={stagger(0.09, 0.05)} initial={reduce ? "show" : "hidden"} animate="show">
            <motion.div variants={rise} className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-[-18px] rounded-[28px] bg-[#b7ff49]/10 blur-2xl" />
                <img src="/steerpast-logo.png" alt="Steerpast" width="80" height="80" className="relative h-16 w-16 rounded-[18px] object-cover shadow-[0_12px_48px_rgba(183,255,73,.12)] sm:h-20 sm:w-20 sm:rounded-[22px]" />
              </div>
            </motion.div>
            <motion.div variants={rise} className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/70">
              <span className="ping-dot h-1.5 w-1.5 rounded-full bg-[#b7ff49] text-[#b7ff49] shadow-[0_0_12px_rgba(183,255,73,.7)]" />
              Identity security for the agentic era
            </motion.div>
            <motion.h1 variants={rise} className="mx-auto max-w-4xl font-serif text-[44px] font-medium leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[80px] lg:leading-[.98]">
              Security for identities <br className="hidden sm:block" /><span className="shimmer-text italic">that can act on their own.</span>
            </motion.h1>
            <motion.p variants={rise} className="mx-auto mt-7 max-w-2xl text-[16px] leading-7 text-white/65 sm:text-[17px] sm:leading-8">
              A security control plane for human and AI-agent access. See what exists, understand what is risky, and turn every important decision into an auditable action.</motion.p>
            <motion.p variants={rise} className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-white/45"><Cpu className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px text-[#b7ff49]/70" aria-hidden="true" />Model-backed decisioning runs through Claude via the Anthropic API.
            </motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Link to="/demo" onClick={demo} className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#b7ff49] px-5 text-[13px] font-semibold text-[#08090a] shadow-[0_0_0_1px_rgba(183,255,73,.4),0_8px_30px_rgba(183,255,73,.25)] transition hover:bg-[#d0ff88] hover:shadow-[0_0_0_1px_rgba(183,255,73,.6),0_10px_40px_rgba(183,255,73,.4)]">
                  Explore the live demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Magnetic>
              <a href="#product" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 px-5 text-[13px] text-white/55 transition hover:border-white/20 hover:text-white">
                See how it works <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>

            </motion.div>

            <div className="mt-16 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/45"><span>A product preview</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] tracking-[0.12em] text-white/50">synthetic demo data</span></div>
            <TiltIn className="product-preview surface-lift relative mx-auto mt-5 overflow-hidden rounded-[24px] border text-left">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#b7ff49]/60 to-transparent" />
              <div className="flex h-10 items-center border-b border-white/[0.07] px-4">
                <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/></div>
                <span className="ml-4 font-mono text-[9px] text-white/45">steerpast.com / security-overview</span>
                <span className="ml-auto flex items-center gap-2 text-[9px] text-white/55"><span className="h-1.5 w-1.5 rounded-full bg-white/35"/>Product preview</span>
              </div>
              <div className="grid md:grid-cols-[180px_1fr]">
                <aside className="hidden border-r border-white/[0.06] p-4 md:block">
                  <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold"><SteerpastMark className="h-5 w-5"/>Steerpast IAM</div>
                  {['Overview','Identities','Entitlements','Audit & decisions','System'].map((x,i)=><div key={x} className={`mb-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[10px] ${i===0?'bg-white/[0.07] text-white':'text-white/50'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{x}</div>)}
                </aside>
                <div className="p-5 md:p-7">
                  <div className="flex items-start justify-between"><div><div className="text-[10px] text-white/45">Security overview</div><div className="mt-1 text-xl font-medium">Access posture</div></div><div className="rounded-full border border-[#b7ff49]/15 bg-[#b7ff49]/[0.05] px-2.5 py-1 text-[9px] text-[#b7ff49]/75">Monitoring active</div></div>
                  <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                    <Metric label="Identities" value={14} delta="humans, services, agents"/>
                    <Metric label="Need action" value={3} delta="revoke or review" danger/>
                    <Metric label="Decision layer" value="Ready" delta="risk + policy + model"/>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
                    <LiveActivity />
                    <LivePipeline />
                  </div>
                </div>
              </div>
            </TiltIn>
          </div>
        </section>

        <section className="border-y border-white/[0.08]">
          <Stagger className="mx-auto grid max-w-[1160px] gap-px px-5 py-0 md:grid-cols-3 lg:px-8">
            <Signal icon={<Eye/>} title="See" text="Know who has access, including autonomous agents and service identities."/>
            <Signal icon={<ScanSearch/>} title="Understand" text="Evaluate identity, risk, and policy together instead of reviewing disconnected alerts."/>
            <Signal icon={<Lock/>} title="Act" text="Move from detection to a defensible remediation decision with evidence."/>
          </Stagger>
        </section>

        <section id="product" className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
          <SectionIntro eyebrow="The product" title="One place to understand every important access decision." text="Steerpast IAM connects identity context, risk, policy, decisioning, remediation, and audit into one continuous workflow."/>
          <div className="mt-16 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            <Feature number="01" icon={<Fingerprint/>} title="Agent-aware identity" text="AI agents increasingly hold credentials and permissions. Give them an explicit identity, owner, environment, and entitlement context." items={['Human, service, and AI-agent identities','Owner and environment awareness','Entitlement and privilege context']}/>
            <Feature number="02" icon={<ShieldCheck/>} title="Risk + policy evaluation" text="A permission is not simply good or bad. Evaluate privilege, sensitivity, blast radius, behavior, and policy constraints together." items={['Privilege escalation detection','Policy conflict evaluation','Sensitive-resource context']}/>
            <Feature number="03" icon={<Sparkles/>} title="Explainable decisions" text="Every important decision carries a human-readable explanation and the evidence that led to it." items={['Decision reasoning','Contributing signals','Operator-friendly audit narrative']}/>
            <Feature number="04" icon={<GitBranch/>} title="Remediation loop" text="Close the gap between finding a problem and fixing it. Turn high-risk access into a proposed action without losing the evidence." items={['Revocation recommendations','Human review controls','Auditable action history']}/>
          </div>
        </section>


        <section id="how-it-works" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <SectionIntro eyebrow="How it works" title="Set the context. Let the system follow the decision." text="Five focused steps connect an access event to an accountable outcome."/>
            <div className="relative mt-14 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#101113] p-5 sm:p-7">
              <div className="pointer-events-none absolute left-[9%] right-[9%] top-[72px] hidden h-px overflow-hidden bg-gradient-to-r from-transparent via-white/15 to-transparent md:block"><motion.div className="h-px w-40 bg-gradient-to-r from-transparent via-[#b7ff49] to-transparent" animate={reduce ? undefined : { x: ["-10rem", "70rem"] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }} /></div>
              <Stagger className="grid gap-3 md:grid-cols-5" step={0.08}>
                {[
                  ['01','Observe','IdentityAgent','Collect identity + entitlement context.',Eye],
                  ['02','Assess','RiskAgent','Score privilege, sensitivity + behavior.',ScanSearch],
                  ['03','Evaluate','PolicyAgent','Check controls + access constraints.',ShieldCheck],
                  ['04','Decide','DecisionAgent','Produce an explainable outcome.',Sparkles],
                  ['05','Act','RemediationAgent','Recommend the safest next action.',GitBranch]
                ].map(([n,t,a,d,Icon])=>{ const I=Icon as React.ElementType; return (
                  <StaggerItem key={n as string}><Spotlight className="h-full rounded-xl border border-white/[0.07] bg-[#0b0c0d]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15">
                    <div className="relative z-10 flex items-center justify-between"><span className="font-mono text-[11px] text-white/55">{n as string}</span><span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-white/55"><I className="h-4 w-4"/></span></div>
                    <div className="mt-8 text-[14px] font-medium">{t as string}</div>
                    <div className="mt-2 font-mono text-[11px] text-white/55">{a as string}</div>
                    <p className="mt-4 text-[13px] leading-6 text-white/65">{d as string}</p>
                  </Spotlight></StaggerItem>
                ); })}
              </Stagger>
            </div>
          </div>
        </section>

        <section id="scenario" className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">A concrete decision</div>
              <h2 className="mt-5 font-serif text-4xl font-medium tracking-[-0.04em] sm:text-5xl">An intern gets production admin access.</h2>
              <p className="mt-6 text-[14px] leading-7 text-white/60">Instead of stopping at “permission changed,” Steerpast follows the event through identity context, risk, policy, decision, and remediation.</p>
              <Link to="/demo" onClick={demo} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[12px] text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white">Open this scenario <ArrowRight className="h-3.5 w-3.5"/></Link>
            </div>
            <div className="surface-lift overflow-hidden rounded-[22px] border">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><span className="font-mono text-[9px] text-white/45">decision-trace / 14:32:08 UTC</span><span className="rounded-full border border-red-400/15 bg-red-400/[0.05] px-2 py-1 text-[8px] text-red-300">HIGH RISK</span></div>
              <Stagger className="px-5" step={0.18} delay={0.2}><Trace icon={<Bot/>} label="Identity" value="Kabir · deployment intern" detail="Human identity · Engineering · Intern"/><Trace icon={<KeyRound/>} label="Access change" value="production-db.admin" detail="New privileged entitlement detected"/><Trace icon={<AlertTriangle/>} label="Risk" value="High · 67 / 100" detail="Production data + privilege escalation"/><Trace icon={<ShieldCheck/>} label="Policy" value="Conflict detected" detail="Intern role cannot hold production admin access"/><Trace icon={<Check/>} label="Decision" value="Recommend revocation" detail="Evidence retained for audit" last/></Stagger>
            </div>
          </div>
        </section>

        <section id="claude" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-start">
              <div>
                <SectionIntro eyebrow="Claude integration" title="Claude sits where the decision needs reasoning." text="Steerpast keeps deterministic identity, risk, and policy signals separate from model reasoning. When ANTHROPIC_API_KEY is configured, DecisionAgent sends that security context to Claude and validates the returned decision before it can enter the remediation flow."/>
                <Link to="/claude" className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[12px] text-white/60 transition hover:border-white/20 hover:text-white">See the Claude architecture <ArrowUpRight className="h-3.5 w-3.5"/></Link>
              </div>
              <div className="rounded-2xl border border-[#b7ff49]/15 bg-[#b7ff49]/[0.025] p-6">
                <div className="flex items-center gap-3"><Cpu className="h-4 w-4 text-[#b7ff49]"/><div className="text-[14px] font-medium">Decision pipeline</div></div>
                <div className="mt-6 space-y-3">
                  {[
                    ['Identity context','owner · role · entitlements','white'],
                    ['Risk signals','privilege · sensitivity · behavior','white'],
                    ['Policy constraints','least privilege · eligibility','white'],
                    ['Claude / DecisionAgent','outcome · rationale · confidence','lime'],
                    ['Remediation + audit','human review · action trail','white']
                  ].map(([name,detail,tone])=>(
                    <div key={name} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/10 px-3 py-3"><span className={tone==='lime'?'h-1.5 w-1.5 rounded-full bg-[#b7ff49] shadow-[0_0_10px_rgba(183,255,73,.5)]':'h-1.5 w-1.5 rounded-full bg-white/25'}/><div><div className="text-[11px] text-white/70">{name}</div><div className="mt-0.5 font-mono text-[9px] text-white/45">{detail}</div></div></div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-[9px] leading-5 text-white/45"><ServerCog className="h-3.5 w-3.5"/>API keys remain server-side; failed model calls fall back to deterministic decisioning.</div>
              </div>
            </div>
          </div>
        </section>
        <section id="architecture">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <SectionIntro eyebrow="Architecture" title="Six specialized agents. One accountable control plane." text="Each agent has a narrow responsibility. The orchestrator connects their outputs into a decision that can be inspected instead of hiding everything behind one opaque score."/>
            <div className="surface-soft relative mt-14 overflow-hidden rounded-[24px] border border-white/[0.08] p-6 sm:p-8">
              <div className="grid gap-4 lg:grid-cols-[1fr_170px_1fr] lg:items-center">
                <div className="grid gap-3">
                  {[
                    ['IdentityAgent','Identity graph','Who is acting?',Fingerprint],
                    ['RiskAgent','Risk engine','How risky is it?',Activity],
                    ['PolicyAgent','Policy evaluation','Is access allowed?',ShieldCheck]
                  ].map(([name,sub,text,Icon])=>{const I=Icon as React.ElementType; return <div key={name as string} className="rounded-xl border border-white/[0.07] bg-[#0b0c0d] p-5 transition hover:border-white/15 hover:bg-white/[0.035]"><div className="flex items-center gap-3"><I className="h-4 w-4 text-white/70"/><span className="font-mono text-[11px] text-white/65">{name as string}</span></div><div className="mt-2 text-[13px] font-medium">{sub as string}</div><p className="mt-1.5 text-[12px] leading-5 text-white/55">{text as string}</p></div>})}
                </div>
                <div className="relative flex min-h-[180px] items-center justify-center">
                  <div className="absolute hidden h-full w-px bg-gradient-to-b from-white/5 via-[#b7ff49]/35 to-white/5 lg:block" />
                  <div className="absolute -left-3 right-[-10px] top-1/2 hidden h-px bg-[#b7ff49]/25 lg:block" />
                  <div className="relative z-10 grid h-28 w-28 place-items-center rounded-[22px] border border-[#b7ff49]/30 bg-[#b7ff49]/[0.07] shadow-[0_0_70px_rgba(183,255,73,.08)]">
                    <div className="text-center"><Sparkles className="mx-auto h-5 w-5 text-[#b7ff49]"/><div className="mt-3 font-mono text-[11px] text-white/75">DecisionAgent</div><div className="mt-1 text-[10px] text-white/50">synthesize</div></div>
                  </div>
                </div>
                <div className="grid gap-3">
                  {[
                    ['RemediationAgent','Action loop','What closes the gap?',GitBranch],
                    ['AuditAgent','Evidence trail','Can it be reconstructed?',Database]
                  ].map(([name,sub,text,Icon])=>{const I=Icon as React.ElementType; return <div key={name as string} className="rounded-xl border border-white/[0.07] bg-[#0b0c0d] p-5 transition hover:border-white/15 hover:bg-white/[0.035]"><div className="flex items-center gap-3"><I className="h-4 w-4 text-white/70"/><span className="font-mono text-[11px] text-white/65">{name as string}</span></div><div className="mt-2 text-[13px] font-medium">{sub as string}</div><p className="mt-1.5 text-[12px] leading-5 text-white/55">{text as string}</p></div>})}
                  <div className="rounded-xl border border-[#b7ff49]/15 bg-[#b7ff49]/[0.025] p-4">
                    <div className="flex items-center gap-3"><Cpu className="h-4 w-4 text-[#b7ff49]"/><span className="font-mono text-[11px] text-white/65">Claude</span></div>
                    <div className="mt-2 text-[12px] font-medium text-white/65">Model reasoning</div>
                    <p className="mt-1.5 text-[11px] leading-5 text-white/55">Optional provider at the DecisionAgent boundary.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Use cases" className="mx-auto max-w-[1160px] px-5 pb-28 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <Reason title="Access reviews" text="Replace spreadsheet-driven reviews with continuously evaluated identity context."/>
            <Reason title="AI-agent governance" text="Treat autonomous agents as first-class identities with owners, privileges, and decision history."/>
            <Reason title="Privileged access" text="Surface dangerous access changes before they become silent standing privilege."/>
          </div>
        </section>


        <section id="security" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Security & trust</div>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Built to make security decisions inspectable.</h2>
              <p className="mt-5 text-[14px] leading-7 text-white/60">The public demo is intentionally isolated and uses sample data. Production integrations should keep secrets server-side and preserve human authority over sensitive remediation.</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101113] p-6 sm:p-7">
              <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-[#b7ff49]/[0.07] blur-3xl" />
              <div className="relative flex items-center gap-4">
                <img src="/steerpast-logo.png" alt="Steerpast" className="h-14 w-14 rounded-[16px] object-cover ring-1 ring-white/10" />
                <div><div className="text-[14px] font-medium">Decision evidence</div><div className="mt-1 text-[12px] text-white/50">Every important access decision stays inspectable.</div></div>
              </div>
              <div className="relative mt-6 space-y-2">
                {[['01','Identity context','owner · role · entitlement'],['02','Risk + policy','privilege · sensitivity · constraint'],['03','Decision','outcome · rationale · confidence'],['04','Action trail','review · revoke · audit evidence']].map(([n,title,detail])=><div key={n} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3"><span className="font-mono text-[9px] text-white/40">{n}</span><div className="min-w-0"><div className="text-[12px] font-medium text-white/70">{title}</div><div className="mt-0.5 font-mono text-[9px] text-white/45">{detail}</div></div><Check className="ml-auto h-3.5 w-3.5 shrink-0 text-[#b7ff49]/65"/></div>)}
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
            {[
              ['Synthetic public demo','The hosted demo does not require a connection to a customer identity provider.'],
              ['Server-side secrets','Anthropic credentials are read from server environment variables, never from browser code.'],
              ['Validated model output','DecisionAgent accepts only supported outcomes, non-empty rationales, and numeric confidence.'],
              ['Human authority','Operators can review, revoke, or override a recommendation and record the reason.']
            ].map(([title,text])=><div key={title} className="bg-[#0b0c0d] p-6"><div className="text-[14px] font-medium">{title}</div><p className="mt-3 text-[12px] leading-6 text-white/50">{text}</p></div>)}
          </div>
          <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-[12px] text-white/65 hover:text-white">Read the security model <ArrowUpRight className="h-3.5 w-3.5"/></Link>
        </div>
        </section>
        <section id="pricing">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <SectionIntro eyebrow="Pricing" title="Start small. Grow when the workflow proves itself." text="Simple early-access pricing while the product is being validated with security teams."/>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {name:'Free',price:'$0',sub:'Explore the model',items:['Identity posture','Decision trace','Local demo'],cta:'Explore demo'},
                {name:'Pilot',price:'$29',sub:'per month · early access',items:['Everything in Free','Agent-aware identities','Remediation controls','Audit evidence'],featured:true,cta:'Start pilot'},
                {name:'Growth',price:'$99',sub:'per month · growing teams',items:['Everything in Pilot','Advanced policy controls','Team workspaces','Priority support'],cta:'Talk to us'},
                {name:'Enterprise',price:'Custom',sub:'deployment & governance',items:['Custom integrations','Security requirements','Deployment support','Volume & SLA planning'],cta:'Contact team'}
              ].map((t,ti)=><Reveal key={t.name} delay={ti*0.07}><Spotlight className={`flex h-full min-h-[410px] flex-col rounded-[20px] border p-7 transition duration-300 hover:-translate-y-1 ${t.featured?'ring-spin border-[#b7ff49]/25 bg-[#b7ff49]/[0.055] shadow-[0_0_70px_rgba(183,255,73,.07)]':'border-white/[0.08] bg-white/[0.018]'}`}>{t.featured&&<div className="absolute right-5 top-5 rounded-full bg-[#b7ff49] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#08090a]">Popular</div>}<div className="text-[13px] font-medium">{t.name}</div><div className="mt-7 font-serif text-4xl tracking-[-0.04em]">{t.price}</div><div className="mt-1 text-[11px] text-white/65">{t.sub}</div><ul className="mt-8 space-y-3">{t.items.map(x=><li key={x} className="flex gap-2 text-[12px] text-white/70"><Check className="mt-0.5 h-3.5 w-3.5 text-[#b7ff49]/65"/>{x}</li>)}</ul><Link to={t.name==='Free'?'/demo':'/company#contact'} onClick={t.name==='Free'?demo:undefined} className={`mt-auto inline-flex h-10 items-center justify-center rounded-full px-4 text-[12px] font-semibold transition hover:-translate-y-0.5 ${t.featured?'bg-[#b7ff49] text-[#08090a] hover:bg-[#d0ff88]':'border border-white/10 bg-white/[0.035] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'}`}>{t.cta}</Link></Spotlight></Reveal>)}
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[900px] px-5 py-28 lg:px-8">
          <div className="text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">FAQ</div>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Before you explore.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-white/55">A few straightforward answers about the product, decisions, agents, and getting started.</p>
          </div>
          <div className="mt-14 border-t border-white/[0.1]">
            {faqItems.map(([question,answer],i)=>{
              const open=openFaq===i;
              return <div key={question} className="border-b border-white/[0.1]">
                <button type="button" onClick={()=>setOpenFaq(open?null:i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className={`text-[14px] font-medium transition ${open?'text-white':'text-white/65'}`}>{question}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-white/55 transition-transform duration-200 ${open?'rotate-45':''}`}><Plus className="h-3.5 w-3.5"/></span>
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${open?'grid-rows-[1fr] opacity-100':'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden"><p className="max-w-2xl pb-6 pr-12 text-[13px] leading-6 text-white/55">{answer}</p></div>
                </div>
              </div>;
            })}
          </div>
        </div>
        </section>

        <section>
          <div className="mx-auto max-w-[900px] px-5 py-28 text-center lg:px-8">
            <SteerpastMark className="mx-auto h-11 w-11"/>
            <h2 className="mt-6 font-serif text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Make every identity decision explainable.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-white/55">Explore the live workspace and follow an identity from context to risk to an explainable action.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic><Link to="/demo" onClick={demo} className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#b7ff49] px-5 text-[13px] font-semibold text-[#08090a] shadow-[0_8px_30px_rgba(183,255,73,.25)] hover:bg-[#d0ff88]">View demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></Link></Magnetic>
              <a href={contactHref} className="inline-flex h-11 items-center rounded-full border border-white/10 px-5 text-[13px] text-white/55 hover:border-white/20 hover:text-white">Contact us</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] bg-[#0b0c0d]">
        <div className="mx-auto max-w-[1160px] px-5 py-14 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div><div className="flex items-center gap-2 text-[14px] font-semibold text-white/75"><SteerpastMark className="h-8 w-8"/>Steerpast IAM</div><p className="mt-4 max-w-xs text-[12px] leading-6 text-white/55">Identity security for systems where humans, services, and AI agents can act with real permissions.</p></div>
            <div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Product</div><div className="mt-4 space-y-3 text-[12px] text-white/65"><a href="#product" className="block transition hover:text-white">Product</a><a href="#how-it-works" className="block transition hover:text-white">How it works</a><a href="#pricing" className="block transition hover:text-white">Pricing</a></div></div>
            <div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Resources</div><div className="mt-4 space-y-3 text-[12px] text-white/65"><a href="/claude" className="block transition hover:text-white">Claude integration</a><a href="/security" className="block transition hover:text-white">Security</a><a href="/company" className="block transition hover:text-white">Company</a><a href="/demo" className="block transition hover:text-white">Demo</a></div></div>
            <div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Company</div><div className="mt-4 space-y-3 text-[12px] text-white/65"><a href="/company#contact" className="block transition hover:text-white">Contact</a><a href="/privacy" className="block transition hover:text-white">Privacy</a><a href="/terms" className="block transition hover:text-white">Terms</a></div></div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Steerpast</span><span>Early access · Product preview</span></div>
        </div>
      </footer>
    </div>
  );
};

function Metric({label,value,delta,danger=false}:{label:string;value:string|number;delta:string;danger?:boolean}) {
  return <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.015] p-3 sm:p-4"><div className="truncate text-[9px] uppercase tracking-[0.12em] text-white/45">{label}</div><div className={`mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.035em] tabular-nums ${danger?'text-red-200':'text-white'}`}><CountUp value={value}/></div><div className={`mt-1 hidden text-[9px] sm:block ${danger?'text-red-300/60':'text-white/45'}`}>{delta}</div></div>;
}
function Signal({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <StaggerItem className="flex gap-4 border-b border-white/[0.08] py-7 last:border-b-0 md:border-b-0 md:border-r md:px-6 md:py-9 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.02] text-white/65">{React.cloneElement(icon as React.ReactElement,{className:'h-3.5 w-3.5'})}</div><div><div className="text-[14px] font-medium">{title}</div><p className="mt-1.5 text-[12px] leading-6 text-white/50">{text}</p></div></StaggerItem>;
}
function SectionIntro({eyebrow,title,text}:{eyebrow:string;title:string;text:string}) {
  return <Reveal className="max-w-2xl"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{eyebrow}</div><h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">{title}</h2><p className="mt-5 text-[14px] leading-7 text-white/60">{text}</p></Reveal>;
}
function Feature({number,icon,title,text,items}:{number:string;icon:React.ReactNode;title:string;text:string;items:string[]}) {
  return <Reveal className="grid gap-8 py-12 md:grid-cols-[72px_1fr_1fr] md:items-start"><div className="font-mono text-[10px] text-white/40">{number}</div><div><div className="flex items-center gap-3">{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4 text-white/65'})}<h3 className="text-[15px] font-medium">{title}</h3></div><p className="mt-4 max-w-lg text-[14px] leading-7 text-white/55">{text}</p></div><ul className="space-y-3 md:pt-1">{items.map(item=><li key={item} className="flex gap-3 text-[12px] text-white/60"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b7ff49]/55"/>{item}</li>)}</ul></Reveal>;
}
function Trace({icon,label,value,detail,last=false}:{icon:React.ReactNode;label:string;value:string;detail:string;last?:boolean}) {
  return <motion.div variants={rise} className={`flex gap-4 py-4 ${last?'':'border-b border-white/[0.06]'}`}><div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-[#101113] text-white/60">{React.cloneElement(icon as React.ReactElement,{className:'h-3.5 w-3.5'})}</div><div><div className="text-[9px] uppercase tracking-[0.12em] text-white/40">{label}</div><div className="mt-1 text-[12px] font-medium text-white/70">{value}</div><div className="mt-1 text-[10px] leading-5 text-white/50">{detail}</div></div></motion.div>;
}
function Reason({title,text}:{title:string;text:string}) {
  return <div className="border-t border-white/[0.1] pt-5"><h3 className="text-[14px] font-medium">{title}</h3><p className="mt-2 text-[14px] leading-7 text-white/55">{text}</p></div>;
}


const feed = [
  { who: 'deployment-intern', what: 'production-db.admin', verdict: 'Revoke recommended', cls: 'text-red-300', dot: 'bg-red-400' },
  { who: 'release-agent', what: 'ci-cd.deploy', verdict: 'Owner review', cls: 'text-amber-300', dot: 'bg-amber-300' },
  { who: 'support-agent', what: 'support-portal.read', verdict: 'Approved', cls: 'text-[#b7ff49]', dot: 'bg-[#b7ff49]' },
  { who: 'finance-contractor', what: 'payments.approve', verdict: 'SoD conflict', cls: 'text-red-300', dot: 'bg-red-400' },
  { who: 'data-pipeline', what: 'warehouse.read', verdict: 'Approved', cls: 'text-[#b7ff49]', dot: 'bg-[#b7ff49]' },
];

function useTicker(length: number, ms: number) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI(x => (x + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms, reduce]);
  return i;
}

function LiveActivity() {
  const tick = useTicker(feed.length, 2600);
  const rows = [0, 1, 2].map(k => feed[(tick + k) % feed.length]);
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] p-4">
      <div className="flex justify-between text-[9px] uppercase tracking-[0.12em] text-white/45"><span>Decision activity</span><span className="flex items-center gap-1.5 text-[#b7ff49]/80"><span className="ping-dot h-1.5 w-1.5 rounded-full bg-[#b7ff49] text-[#b7ff49]"/>Live</span></div>
      <div className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map(r => (
            <motion.div
              key={r.who}
              layout
              initial={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3"
            >
              <div><div className="text-[11px] text-white/75">{r.who}</div><div className="mt-1 font-mono text-[9px] text-white/45">{r.what}</div></div>
              <span className={`flex items-center gap-1.5 text-[9px] ${r.cls}`}><span className={`h-1 w-1 rounded-full ${r.dot}`}/>{r.verdict}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const pipeline = [['IdentityAgent','context loaded'],['RiskAgent','risk scored'],['PolicyAgent','policy checked'],['DecisionAgent','decision ready']];

function LivePipeline() {
  const step = useTicker(pipeline.length + 2, 900);
  const reduce = useReducedMotion();
  const done = reduce ? pipeline.length : Math.min(step, pipeline.length);
  return (
    <div className="rounded-xl border border-white/[0.07] p-4">
      <div className="text-[9px] uppercase tracking-[0.12em] text-white/45">Evaluation pipeline</div>
      <div className="mt-5 space-y-3">
        {pipeline.map(([a,b],i) => {
          const state = i < done ? 'done' : i === done ? 'active' : 'idle';
          return (
            <div key={a} className="flex items-center gap-3">
              <span className={`relative h-1.5 w-1.5 rounded-full transition-colors duration-300 ${state==='done' ? 'bg-[#b7ff49]' : state==='active' ? 'ping-dot bg-white/70 text-white/70' : 'bg-white/20'}`}/>
              <span className={`font-mono text-[9px] transition-colors duration-300 ${state==='idle' ? 'text-white/40' : 'text-white/80'}`}>{a}</span>
              <span className="ml-auto text-[8px] text-white/45">{state==='done' ? b : state==='active' ? 'running…' : 'queued'}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.div className="h-full rounded-full bg-[#b7ff49]" animate={{ width: `${(done / pipeline.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE_OUT }} /></div>
      <div className="mt-4 border-t border-white/[0.06] pt-4"><div className="text-[8px] uppercase tracking-[0.12em] text-white/40">Current decision</div><div className="mt-1 text-[11px] text-white/75">{done >= pipeline.length ? 'Recommend revocation' : 'Evaluating…'}</div></div>
    </div>
  );
}
