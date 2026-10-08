import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ShieldCheck, Activity, Lock, GitBranch, Eye, AlertTriangle, Check, ChevronRight, Database, KeyRound, Sparkles, Fingerprint, Network, ScanSearch, Plus, Cpu, ServerCog, ArrowUpRight } from 'lucide-react';

const demo = () => localStorage.setItem('steerpast-iam-auth','true');
const contactHref = 'mailto:' + ['omjadiye','steerpast.com'].join('@');

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

  return (
    <div className="landing-page min-h-screen bg-[#08090a] text-[#eeeae0] selection:bg-[#b7ff49]/20">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08090a]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[68px] max-w-[1160px] items-center justify-between px-5 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 text-[14px] font-semibold tracking-[-0.02em]">
            <SteerpastMark className="h-7 w-7" />
            Steerpast <span className="text-white/30">IAM</span>
          </a>
          <div className="hidden items-center gap-6 text-[12px] text-white/45 md:flex">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
            <a href="#scenario" className="transition hover:text-white">Scenario</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#claude" className="transition hover:text-white">Claude</a><a href="#security" className="transition hover:text-white">Security</a><a href="#faq" className="transition hover:text-white">FAQ</a>
          </div>
          <Link to="/demo" onClick={demo} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#eeeae0] px-4 text-[12px] font-medium text-[#08090a] transition hover:bg-white">
            View demo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(183,255,73,0.08),transparent_62%)]" />
          <div className="relative mx-auto max-w-[1000px] px-5 pb-28 pt-24 text-center lg:pt-32">
            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b7ff49] shadow-[0_0_12px_rgba(183,255,73,.7)]" />
              Identity security for the agentic era
            </div>
            <h1 className="mx-auto max-w-4xl font-serif text-[50px] font-medium leading-[.98] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
              Security for identities<br /><span className="text-white/38">that can act on their own.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-7 text-white/43">
              A security control plane for human and AI-agent access. See what exists, understand what is risky, and turn every important decision into an auditable action.<br/><span className="text-white/25">Model-backed decisioning can run through Claude via the Anthropic API.</span>
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/demo" onClick={demo} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#b7ff49] px-5 text-[13px] font-semibold text-[#08090a] transition hover:bg-[#d0ff88]">
                Explore the live demo <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#product" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 px-5 text-[13px] text-white/55 transition hover:border-white/20 hover:text-white">
                See how it works <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-16 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/22"><span>A product preview</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] tracking-[0.12em] text-white/30">synthetic demo data</span></div>
            <div className="product-preview mx-auto mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#101113] text-left">
              <div className="flex h-10 items-center border-b border-white/[0.07] px-4">
                <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/></div>
                <span className="ml-4 font-mono text-[9px] text-white/22">steerpast.com / security-overview</span>
                <span className="ml-auto flex items-center gap-2 text-[9px] text-white/35"><span className="h-1.5 w-1.5 rounded-full bg-white/35"/>Product preview</span>
              </div>
              <div className="grid md:grid-cols-[180px_1fr]">
                <aside className="hidden border-r border-white/[0.06] p-4 md:block">
                  <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold"><SteerpastMark className="h-5 w-5"/>Steerpast IAM</div>
                  {['Overview','Identities','Entitlements','Audit & decisions','System'].map((x,i)=><div key={x} className={`mb-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[10px] ${i===0?'bg-white/[0.07] text-white':'text-white/28'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{x}</div>)}
                </aside>
                <div className="p-5 md:p-7">
                  <div className="flex items-start justify-between"><div><div className="text-[10px] text-white/25">Security overview</div><div className="mt-1 text-xl font-medium">Access posture</div></div><div className="rounded-full border border-[#b7ff49]/15 bg-[#b7ff49]/[0.05] px-2.5 py-1 text-[9px] text-[#b7ff49]/75">Monitoring active</div></div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Metric label="Sample identities" value="Demo" delta="synthetic dataset"/>
                    <Metric label="Risk cases" value="High" delta="illustrative scenario" danger/>
                    <Metric label="Decision layer" value="Ready" delta="risk + policy + model"/>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
                    <div className="rounded-xl border border-white/[0.07] p-4">
                      <div className="flex justify-between text-[9px] uppercase tracking-[0.12em] text-white/22"><span>Decision activity</span><span>Live</span></div>
                      {[['deployment-intern','production-db.admin','Revocation recommended','text-red-300'],['release-agent','payments.read','Allowed','text-[#b7ff49]'],['support-agent','customer.export','Step-up required','text-amber-300']].map(([a,b,c,cl])=><div key={a} className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3"><div><div className="text-[11px] text-white/70">{a}</div><div className="mt-1 font-mono text-[9px] text-white/22">{b}</div></div><span className={`text-[9px] ${cl}`}>{c}</span></div>)}
                    </div>
                    <div className="rounded-xl border border-white/[0.07] p-4">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-white/22">Evaluation pipeline</div>
                      <div className="mt-5 space-y-3">{[['IdentityAgent','context loaded'],['RiskAgent','risk scored'],['PolicyAgent','policy checked'],['DecisionAgent','decision ready']].map(([a,b],i)=><div key={a} className="flex items-center gap-3"><span className={`h-1.5 w-1.5 rounded-full ${i===3?'bg-[#b7ff49]':'bg-white/25'}`}/><span className="font-mono text-[9px] text-white/50">{a}</span><span className="ml-auto text-[8px] text-white/18">{b}</span></div>)}</div>
                      <div className="mt-6 border-t border-white/[0.06] pt-4"><div className="text-[8px] uppercase tracking-[0.12em] text-white/18">Current decision</div><div className="mt-1 text-[11px] text-white/65">Recommend revocation</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.08]">
          <div className="mx-auto grid max-w-[1160px] gap-px px-5 py-0 md:grid-cols-3 lg:px-8">
            <Signal icon={<Eye/>} title="See" text="Know who has access, including autonomous agents and service identities."/>
            <Signal icon={<ScanSearch/>} title="Understand" text="Evaluate identity, risk, and policy together instead of reviewing disconnected alerts."/>
            <Signal icon={<Lock/>} title="Act" text="Move from detection to a defensible remediation decision with evidence."/>
          </div>
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


        <section id="claude" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-start">
              <div>
                <SectionIntro eyebrow="Claude integration" title="Claude sits where the decision needs reasoning." text="Steerpast keeps deterministic identity, risk, and policy signals separate from model reasoning. When ANTHROPIC_API_KEY is configured, DecisionAgent sends that security context to Claude and validates the returned decision before it can enter the remediation flow."/>
                <Link to="/claude" className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[12px] text-white/60 transition hover:border-white/20 hover:text-white">See the Claude architecture <ArrowUpRight className="h-3.5 w-3.5"/></Link>
              </div>
              <div className="rounded-2xl border border-[#b7ff49]/15 bg-[#b7ff49]/[0.025] p-6">
                <div className="flex items-center gap-3"><Cpu className="h-4 w-4 text-[#b7ff49]"/><div className="text-[13px] font-medium">Decision pipeline</div></div>
                <div className="mt-6 space-y-3">
                  {[
                    ['Identity context','owner · role · entitlements','white'],
                    ['Risk signals','privilege · sensitivity · behavior','white'],
                    ['Policy constraints','least privilege · eligibility','white'],
                    ['Claude / DecisionAgent','outcome · rationale · confidence','lime'],
                    ['Remediation + audit','human review · action trail','white']
                  ].map(([name,detail,tone])=>(
                    <div key={name} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/10 px-3 py-3"><span className={tone==='lime'?'h-1.5 w-1.5 rounded-full bg-[#b7ff49] shadow-[0_0_10px_rgba(183,255,73,.5)]':'h-1.5 w-1.5 rounded-full bg-white/25'}/><div><div className="text-[11px] text-white/70">{name}</div><div className="mt-0.5 font-mono text-[9px] text-white/22">{detail}</div></div></div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-[9px] leading-5 text-white/25"><ServerCog className="h-3.5 w-3.5"/>API keys remain server-side; failed model calls fall back to deterministic decisioning.</div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <SectionIntro eyebrow="How it works" title="Set the context. Let the system follow the decision." text="Five focused steps connect an access event to an accountable outcome."/>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-5">
              {[['01','Observe','IdentityAgent','Collect identity and entitlement context.'],['02','Assess','RiskAgent','Score privilege, sensitivity, and behavior.'],['03','Evaluate','PolicyAgent','Check policies and access constraints.'],['04','Decide','DecisionAgent','Produce an explainable outcome.'],['05','Act','RemediationAgent','Recommend the safest next action.']].map(([n,t,a,d])=><div key={n} className="bg-[#0b0c0d] p-6 md:min-h-[230px]"><div className="font-mono text-[9px] text-white/20">{n}</div><div className="mt-12 text-[14px] font-medium">{t}</div><div className="mt-2 font-mono text-[9px] text-white/25">{a}</div><p className="mt-4 text-[12px] leading-5 text-white/30">{d}</p></div>)}
            </div>
          </div>
        </section>

        <section id="scenario" className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">A concrete decision</div>
              <h2 className="mt-5 font-serif text-4xl font-medium tracking-[-0.04em] sm:text-5xl">An intern gets production admin access.</h2>
              <p className="mt-6 text-[14px] leading-7 text-white/38">Instead of stopping at “permission changed,” Steerpast follows the event through identity context, risk, policy, decision, and remediation.</p>
              <Link to="/demo" onClick={demo} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[12px] text-white/60 transition hover:border-white/20 hover:text-white">Open this scenario <ArrowRight className="h-3.5 w-3.5"/></Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101113]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><span className="font-mono text-[9px] text-white/25">decision-trace / 14:32:08 UTC</span><span className="rounded-full border border-red-400/15 bg-red-400/[0.05] px-2 py-1 text-[8px] text-red-300">HIGH RISK</span></div>
              <div className="px-5"><Trace icon={<Bot/>} label="Identity" value="deployment-intern" detail="Human identity · Engineering · Intern"/><Trace icon={<KeyRound/>} label="Access change" value="production-db.admin" detail="New privileged entitlement detected"/><Trace icon={<AlertTriangle/>} label="Risk" value="High · 92 / 100" detail="Production data + privilege escalation"/><Trace icon={<ShieldCheck/>} label="Policy" value="Conflict detected" detail="Intern role cannot hold production admin access"/><Trace icon={<Check/>} label="Decision" value="Recommend revocation" detail="Evidence retained for audit" last/></div>
            </div>
          </div>
        </section>

        <section id="architecture" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <SectionIntro eyebrow="Architecture" title="Six specialized agents. One accountable control plane." text="Each agent has a narrow responsibility. The orchestrator connects their outputs into a decision that can be inspected instead of hiding everything behind one opaque score."/>
            <div className="mt-14 grid overflow-hidden rounded-2xl border border-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
              {[['IdentityAgent','Identity graph','Who is acting, and what context belongs to them?',Fingerprint],['RiskAgent','Risk engine','How dangerous is this access in context?',Activity],['PolicyAgent','Policy evaluation','Does the requested access violate a control?',ShieldCheck],['DecisionAgent','Decision synthesis','What should happen, and why?',Sparkles],['RemediationAgent','Action loop','What safe next action closes the gap?',GitBranch],['AuditAgent','Evidence trail','Can every decision be reconstructed later?',Database]].map(([name,sub,text,Icon])=>{const I=Icon as React.ElementType; return <div key={name as string} className="border-b border-r border-white/[0.07] p-6"><I className="h-4 w-4 text-white/40"/><div className="mt-6 font-mono text-[10px] text-white/30">{name as string}</div><div className="mt-1 text-[14px] font-medium">{sub as string}</div><p className="mt-3 text-[12px] leading-5 text-white/28">{text as string}</p></div>})}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <Reason title="Access reviews" text="Replace spreadsheet-driven reviews with continuously evaluated identity context."/>
            <Reason title="AI-agent governance" text="Treat autonomous agents as first-class identities with owners, privileges, and decision history."/>
            <Reason title="Privileged access" text="Surface dangerous access changes before they become silent standing privilege."/>
          </div>
        </section>


        <section id="security" className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">Security & trust</div>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Built to make security decisions inspectable.</h2>
              <p className="mt-5 text-[14px] leading-7 text-white/36">The public demo is intentionally isolated and uses sample data. Production integrations should keep secrets server-side and preserve human authority over sensitive remediation.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
              []
            </div>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
            {[
              ['Synthetic public demo','The hosted demo does not require a connection to a customer identity provider.'],
              ['Server-side secrets','Anthropic credentials are read from server environment variables, never from browser code.'],
              ['Validated model output','DecisionAgent accepts only supported outcomes, non-empty rationales, and numeric confidence.'],
              ['Human authority','Operators can review, revoke, or override a recommendation and record the reason.']
            ].map(([title,text])=><div key={title} className="bg-[#0b0c0d] p-6"><div className="text-[13px] font-medium">{title}</div><p className="mt-3 text-[11px] leading-5 text-white/28">{text}</p></div>)}
          </div>
          <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-[12px] text-white/45 hover:text-white">Read the security model <ArrowUpRight className="h-3.5 w-3.5"/></Link>
        </section>
        <section id="pricing" className="border-y border-white/[0.08] bg-[#0b0c0d]">
          <div className="mx-auto max-w-[1160px] px-5 py-28 lg:px-8">
            <SectionIntro eyebrow="Pricing" title="Start small. Grow when the workflow proves itself." text="Simple early-access pricing while the product is being validated with security teams."/>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {name:'Free',price:'$0',sub:'Explore the model',items:['Identity posture','Decision trace','Local demo']},
                {name:'Pilot',price:'$29',sub:'per month · early access',items:['Everything in Free','Agent-aware identities','Remediation controls','Audit evidence'],featured:true},
                {name:'Growth',price:'$99',sub:'per month · growing teams',items:['Everything in Pilot','Advanced policy controls','Team workspaces','Priority support']},
                {name:'Enterprise',price:'Custom',sub:'deployment & governance',items:['Custom integrations','Security requirements','Deployment support','Volume & SLA planning']}
              ].map(t=><div key={t.name} className={`relative rounded-2xl border p-7 ${t.featured?'border-[#b7ff49]/25 bg-[#b7ff49]/[0.035]':'border-white/[0.08] bg-white/[0.015]'}`}>{t.featured&&<div className="absolute right-5 top-5 rounded-full border border-[#b7ff49]/20 px-2 py-1 text-[8px] uppercase tracking-wider text-[#b7ff49]/65">Popular</div>}<div className="text-[12px] font-medium">{t.name}</div><div className="mt-7 font-serif text-4xl tracking-[-0.04em]">{t.price}</div><div className="mt-1 text-[10px] text-white/22">{t.sub}</div><ul className="mt-8 space-y-3">{t.items.map(x=><li key={x} className="flex gap-2 text-[11px] text-white/38"><Check className="mt-0.5 h-3.5 w-3.5 text-[#b7ff49]/60"/>{x}</li>)}</ul></div>)}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[900px] px-5 py-28 lg:px-8">
          <div className="text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">FAQ</div>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Before you explore.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-white/35">A few straightforward answers about the product, decisions, agents, and getting started.</p>
          </div>
          <div className="mt-14 border-t border-white/[0.1]">
            {faqItems.map(([question,answer],i)=>{
              const open=openFaq===i;
              return <div key={question} className="border-b border-white/[0.1]">
                <button type="button" onClick={()=>setOpenFaq(open?null:i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className={`text-[13px] font-medium transition ${open?'text-white':'text-white/65'}`}>{question}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-white/35 transition-transform duration-200 ${open?'rotate-45':''}`}><Plus className="h-3.5 w-3.5"/></span>
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${open?'grid-rows-[1fr] opacity-100':'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden"><p className="max-w-2xl pb-6 pr-12 text-[13px] leading-6 text-white/35">{answer}</p></div>
                </div>
              </div>;
            })}
          </div>
        </section>

        <section className="border-t border-white/[0.08]">
          <div className="mx-auto max-w-[900px] px-5 py-28 text-center lg:px-8">
            <SteerpastMark className="mx-auto h-11 w-11"/>
            <h2 className="mt-6 font-serif text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Make every identity decision explainable.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-white/35">Explore the live workspace and follow an identity from context to risk to an explainable action.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/demo" onClick={demo} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#b7ff49] px-5 text-[13px] font-semibold text-[#08090a] hover:bg-[#d0ff88]">View demo <ArrowRight className="h-4 w-4"/></Link>
              <a href={contactHref} className="inline-flex h-11 items-center rounded-full border border-white/10 px-5 text-[13px] text-white/55 hover:border-white/20 hover:text-white">Contact us</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-6 px-5 py-8 text-[10px] text-white/22 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 text-white/55"><SteerpastMark className="h-6 w-6"/>Steerpast IAM</div>
          <div className="flex flex-wrap items-center gap-5"><a href="#product" className="hover:text-white/55">Product</a><a href="#pricing" className="hover:text-white/55">Pricing</a><a href="#faq" className="hover:text-white/55">FAQ</a><a href="/claude" className="hover:text-white/55">Claude</a><a href="/security" className="hover:text-white/55">Security</a><a href="/company" className="hover:text-white/55">Company</a><a href={contactHref} className="hover:text-white/55">Contact</a><span>© 2026 Steerpast</span></div>
        </div>
      </footer>
    </div>
  );
};

function Metric({label,value,delta,danger=false}:{label:string;value:string;delta:string;danger?:boolean}) {
  return <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4"><div className="text-[9px] uppercase tracking-[0.12em] text-white/22">{label}</div><div className={`mt-2 text-2xl font-semibold tracking-[-0.035em] ${danger?'text-red-200':'text-white'}`}>{value}</div><div className={`mt-1 text-[9px] ${danger?'text-red-300/60':'text-white/22'}`}>{delta}</div></div>;
}
function Signal({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div className="flex gap-4 border-r border-white/[0.08] px-5 py-8 first:pl-0 last:border-r-0 last:pr-0"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.02] text-white/45">{React.cloneElement(icon as React.ReactElement,{className:'h-3.5 w-3.5'})}</div><div><div className="text-[13px] font-medium">{title}</div><p className="mt-1.5 text-[11px] leading-5 text-white/30">{text}</p></div></div>;
}
function SectionIntro({eyebrow,title,text}:{eyebrow:string;title:string;text:string}) {
  return <div className="max-w-2xl"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">{eyebrow}</div><h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">{title}</h2><p className="mt-5 text-[14px] leading-7 text-white/36">{text}</p></div>;
}
function Feature({number,icon,title,text,items}:{number:string;icon:React.ReactNode;title:string;text:string;items:string[]}) {
  return <div className="grid gap-8 py-12 md:grid-cols-[72px_1fr_1fr] md:items-start"><div className="font-mono text-[10px] text-white/18">{number}</div><div><div className="flex items-center gap-3">{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4 text-white/45'})}<h3 className="text-[15px] font-medium">{title}</h3></div><p className="mt-4 max-w-lg text-[13px] leading-7 text-white/35">{text}</p></div><ul className="space-y-3 md:pt-1">{items.map(item=><li key={item} className="flex gap-3 text-[12px] text-white/38"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b7ff49]/55"/>{item}</li>)}</ul></div>;
}
function Trace({icon,label,value,detail,last=false}:{icon:React.ReactNode;label:string;value:string;detail:string;last?:boolean}) {
  return <div className={`flex gap-4 py-4 ${last?'':'border-b border-white/[0.06]'}`}><div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-[#101113] text-white/40">{React.cloneElement(icon as React.ReactElement,{className:'h-3.5 w-3.5'})}</div><div><div className="text-[9px] uppercase tracking-[0.12em] text-white/20">{label}</div><div className="mt-1 text-[12px] font-medium text-white/70">{value}</div><div className="mt-1 text-[10px] leading-5 text-white/28">{detail}</div></div></div>;
}
function Reason({title,text}:{title:string;text:string}) {
  return <div className="border-t border-white/[0.1] pt-5"><h3 className="text-[14px] font-medium">{title}</h3><p className="mt-2 text-[12px] leading-6 text-white/32">{text}</p></div>;
}
