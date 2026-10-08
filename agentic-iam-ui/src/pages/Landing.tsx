import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ShieldCheck, Activity, Lock, GitBranch, Eye, AlertTriangle, Check, ChevronRight, Database, KeyRound, Sparkles, Fingerprint, Network, ScanSearch } from 'lucide-react';

const demo = () => localStorage.setItem('steerpast-iam-auth','true');
const contactHref = 'mailto:' + ['omjadiye','steerpast.com'].join('@');

const SteerpastMark = ({className='h-7 w-7'}:{className?:string}) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs><linearGradient id="steerpast-mark-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4ffd0"/><stop offset="0.48" stopColor="#b7ff49"/><stop offset="1" stopColor="#00ed4f"/></linearGradient></defs>
    <path fill="url(#steerpast-mark-gradient)" d="M5 4h31c14 0 23 10 23 24 0 12-7 20-18 24l-1-8c7-3 10-8 10-16 0-8-5-13-14-13H16c-7 0-10 3-11 9V4Z"/>
    <path fill="#050505" d="M5 28c3-7 8-10 16-10h16c4 0 7 2 7 5s-2 5-7 5H20c-3 0-5 1-5 3 0 2 2 3 6 4l15 5c5 2 8 5 8 9 0 4-3 7-8 9L5 60l26-17c3-2 3-4 0-5l-18-6c-6-2-9-6-8-10v6Z"/>
  </svg>
);

const Metric = ({label,value,delta,danger=false}:{label:string;value:string;delta:string;danger?:boolean}) => (
  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
    <div className="text-[11px] text-white/35">{label}</div>
    <div className={`mt-2 text-2xl font-semibold tracking-[-0.035em] ${danger?'text-red-200':'text-white'}`}>{value}</div>
    <div className={`mt-1 text-[10px] ${danger?'text-red-300/60':'text-white/25'}`}>{delta}</div>
  </div>
);

const Trace = ({icon,label,value,detail,last=false}:{icon:React.ReactNode;label:string;value:string;detail:string;last?:boolean}) => (
  <div className={`relative flex gap-4 py-4 ${!last?'border-b border-white/[0.06]':''}`}>
    <div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-[#0d0e11] text-white/45">{React.cloneElement(icon as React.ReactElement,{className:'h-3.5 w-3.5'})}</div>
    <div className="min-w-0"><div className="text-[10px] uppercase tracking-[0.12em] text-white/25">{label}</div><div className="mt-1 text-[13px] font-medium text-white/80">{value}</div><div className="mt-1 text-[11px] leading-5 text-white/30">{detail}</div></div>
  </div>
);

const SectionIntro = ({eyebrow,title,text}:{eyebrow:string;title:string;text:string}) => (
  <div className="max-w-2xl">
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">{eyebrow}</div>
    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">{title}</h2>
    <p className="mt-5 text-[15px] leading-7 text-white/42">{text}</p>
  </div>
);

const ProductRow = ({number,icon,title,text,items}:{number:string;icon:React.ReactNode;title:string;text:string;items:string[]}) => (
  <div className="grid gap-8 py-12 md:grid-cols-[72px_1fr_1fr] md:items-start">
    <div className="text-[11px] font-mono text-white/20">{number}</div>
    <div><div className="flex items-center gap-3">{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4 text-white/60'})}<h3 className="text-lg font-medium">{title}</h3></div><p className="mt-4 max-w-lg text-[14px] leading-7 text-white/40">{text}</p></div>
    <ul className="space-y-3 md:pt-1">{items.map(item=><li key={item} className="flex gap-3 text-[13px] text-white/45"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35"/>{item}</li>)}</ul>
  </div>
);

export const Landing: React.FC = () => (
  <div className="landing-page min-h-screen bg-[#08090b] text-[#f7f7f8] selection:bg-white/20">
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#08090b]/82 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1220px] items-center justify-between px-5 lg:px-8">
        <a href="#" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em]">
          <SteerpastMark className="h-7 w-7"/>
          Steerpast <span className="text-white/35">IAM</span>
        </a>
        <div className="hidden items-center gap-7 text-[13px] text-white/48 md:flex"><a href="#product" className="hover:text-white">Product</a><a href="#how-it-works" className="hover:text-white">How it works</a><a href="#scenario" className="hover:text-white">Scenario</a><a href="#architecture" className="hover:text-white">Architecture</a><a href="#pricing" className="hover:text-white">Pricing</a><a href={contactHref} className="hover:text-white">Contact us</a></div>
        <Link to="/demo" onClick={demo} className="group inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[13px] font-medium hover:border-white/25 hover:bg-white/[0.1]">View demo <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"/></Link>
      </nav>
    </header>

    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(ellipse_at_top,rgba(120,119,255,0.11),transparent_64%)]"/>
        <div className="pointer-events-none absolute left-1/2 top-48 h-px w-[760px] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"/>
        <div className="relative mx-auto max-w-[1220px] px-5 pb-28 pt-28 text-center lg:px-8 lg:pt-36">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[12px] text-white/55"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]"/>Identity security for the agentic era</div>
          <h1 className="mx-auto max-w-5xl text-[49px] font-semibold leading-[.99] tracking-[-0.06em] sm:text-6xl lg:text-[78px]">Security for identities<br/><span className="text-white/40">that can act on their own.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-[16px] leading-7 text-white/48">Steerpast IAM continuously maps human and AI-agent access, evaluates risky changes, explains decisions, and turns findings into auditable action.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/demo" onClick={demo} className="group inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[14px] font-medium text-black shadow-[0_0_35px_rgba(255,255,255,.08)] hover:bg-white/90">View demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/></Link>
            <a href="#product" className="inline-flex h-11 items-center gap-1 rounded-md border border-white/10 px-5 text-[14px] font-medium text-white/60 hover:border-white/20 hover:text-white">Explore the product <ChevronRight className="h-4 w-4"/></a>
          </div>

          <div className="product-preview mx-auto mt-20 max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] text-left shadow-[0_40px_120px_rgba(0,0,0,.5)]">
            <div className="flex h-10 items-center border-b border-white/[0.07] px-4"><div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/><span className="h-2 w-2 rounded-full bg-white/15"/></div><span className="ml-4 font-mono text-[10px] text-white/25">app.steerpast.dev / security-overview</span><span className="ml-auto flex items-center gap-2 text-[10px] text-emerald-300/65"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Evaluation live</span></div>
            <div className="grid min-h-[410px] md:grid-cols-[185px_1fr]">
              <aside className="hidden border-r border-white/[0.06] p-4 md:block"><div className="mb-5 text-[12px] font-semibold">Steerpast <span className="text-white/30">IAM</span></div>{['Overview','Identities','Entitlements','Audit & decisions','System'].map((x,i)=><div key={x} className={`mb-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] ${i===0?'bg-white/[0.08] text-white':'text-white/32'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{x}</div>)}</aside>
              <div className="p-5 md:p-7">
                <div className="flex items-start justify-between"><div><div className="text-[11px] text-white/30">Security overview</div><div className="mt-1 text-xl font-medium tracking-[-0.025em]">Access posture</div></div><div className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] text-emerald-300">Monitoring active</div></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Identities" value="1,284" delta="+24 this week"/><Metric label="High-risk access" value="17" delta="5 need review" danger/><Metric label="Policy decisions" value="98.7%" delta="evaluated continuously"/></div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-4"><div className="flex justify-between text-[10px] text-white/30"><span>Decision activity</span><span>Live</span></div>
                    {[['deployment-intern','production-db.admin','Revocation recommended','text-red-300'],['release-agent','payments.read','Allowed','text-emerald-300'],['support-agent','customer.export','Step-up required','text-amber-300']].map(([a,b,c,cl])=><div key={a} className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3"><div><div className="text-[12px] text-white/75">{a}</div><div className="mt-1 font-mono text-[10px] text-white/25">{b}</div></div><span className={`text-[10px] ${cl}`}>{c}</span></div>)}
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-4"><div className="text-[10px] text-white/30">Evaluation pipeline</div><div className="mt-5 space-y-2">{[['IdentityAgent','context loaded'],['RiskAgent','risk scored'],['PolicyAgent','policy checked'],['DecisionAgent','decision ready']].map(([a,b],i)=><div key={a} className="flex items-center gap-3"><span className={`h-1.5 w-1.5 rounded-full ${i===3?'bg-emerald-400':'bg-white/30'}`}/><span className="font-mono text-[10px] text-white/55">{a}</span><span className="ml-auto text-[9px] text-white/20">{b}</span></div>)}</div><div className="mt-6 border-t border-white/[0.06] pt-4"><div className="text-[9px] uppercase tracking-[.12em] text-white/20">Current decision</div><div className="mt-1 text-[12px] text-white/70">Recommend revocation</div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018]"><div className="mx-auto max-w-[1220px] px-5 py-10 lg:px-8"><div className="grid gap-8 md:grid-cols-3">{[['See','Know who has access, including autonomous agents and service identities.',Eye],['Understand','Evaluate risk and policy together instead of reviewing disconnected alerts.',ScanSearch],['Act','Move from detection to a defensible remediation decision with evidence.',Lock]].map(([t,d,I])=><div key={t} className="flex gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.025]"><I className="h-4 w-4 text-white/55"/></div><div><div className="text-[13px] font-medium">{t}</div><p className="mt-1.5 text-[12px] leading-5 text-white/32">{d}</p></div></div>)}</div></div></section>

      <section id="product" className="mx-auto max-w-[1220px] px-5 py-32 lg:px-8"><SectionIntro eyebrow="The product" title="A security control plane for identity decisions." text="Steerpast IAM sits between identity data and sensitive actions. It turns raw access changes into decisions your security team can understand, review, and audit."/><div className="mt-16 divide-y divide-white/[0.07] border-y border-white/[0.07]"><ProductRow number="01" icon={<Fingerprint/>} title="Agent-aware identity" text="Model AI agents like real identities. Track ownership, role, entitlements, environment, and behavior so an agent never becomes an invisible privileged user." items={['Human, service, and AI-agent identities','Owner and environment awareness','Entitlement and privilege context']}/><ProductRow number="02" icon={<ShieldCheck/>} title="Risk + policy evaluation" text="Combine deterministic controls with contextual risk signals. A permission is evaluated in context—not simply labeled good or bad." items={['Privilege escalation detection','Policy conflict evaluation','Blast-radius and sensitivity context']}/><ProductRow number="03" icon={<Sparkles/>} title="Explainable decisions" text="Every important decision gets a human-readable explanation with the evidence behind an allow, deny, review, or revoke recommendation." items={['Decision reasoning','Evidence and contributing signals','Operator-friendly audit narrative']}/><ProductRow number="04" icon={<GitBranch/>} title="Remediation loop" text="Close the gap between finding a problem and fixing it. Turn high-risk access into a proposed action while preserving the evidence." items={['Revocation recommendations','Human review controls','Auditable action history']}/></div></section>

      <section id="how-it-works" className="border-y border-white/[0.07] bg-[#0b0c0f]"><div className="mx-auto max-w-[1220px] px-5 py-32 lg:px-8"><SectionIntro eyebrow="How it works" title="From access change to accountable decision." text="The system follows a simple chain: observe the identity, understand the access, evaluate the risk, explain the decision, then create a remediation path."/><div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-5">{[['01','Observe','IdentityAgent','Collect identity and entitlement context.'],['02','Assess','RiskAgent','Score privilege, sensitivity, and behavioral risk.'],['03','Evaluate','PolicyAgent','Check policies and access constraints.'],['04','Decide','DecisionAgent','Produce an explainable security decision.'],['05','Act','RemediationAgent','Recommend or execute the next safe action.']].map(([n,t,a,d])=><div key={n} className="bg-[#0b0c0f] p-6 md:min-h-[245px]"><div className="font-mono text-[10px] text-white/20">{n}</div><div className="mt-12 text-[15px] font-medium">{t}</div><div className="mt-2 font-mono text-[10px] text-white/30">{a}</div><p className="mt-4 text-[12px] leading-5 text-white/35">{d}</p></div>)}</div></div></section>

      <section id="scenario" className="mx-auto max-w-[1220px] px-5 py-32 lg:px-8"><div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">A concrete decision</div><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">An intern gets production admin access.</h2><p className="mt-6 text-[15px] leading-7 text-white/42">This is where a conventional IAM dashboard stops. Steerpast IAM follows the change through identity context, risk, policy, decision, and remediation.</p><Link to="/demo" onClick={demo} className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-white hover:text-white/65">Open this scenario <ArrowRight className="h-4 w-4"/></Link></div><div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c0f]"><div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><span className="font-mono text-[10px] text-white/30">decision-trace / 14:32:08 UTC</span><span className="rounded-md border border-red-400/15 bg-red-400/[0.05] px-2 py-1 text-[9px] text-red-300">HIGH RISK</span></div><div className="px-5"><Trace icon={<Bot/>} label="Identity" value="deployment-intern" detail="Human identity · Engineering · Intern"/><Trace icon={<KeyRound/>} label="Access change" value="production-db.admin" detail="New privileged entitlement detected"/><Trace icon={<AlertTriangle/>} label="Risk" value="High · 92 / 100" detail="Production data + privilege escalation"/><Trace icon={<ShieldCheck/>} label="Policy" value="Conflict detected" detail="Intern role cannot hold production admin access"/><Trace icon={<Check/>} label="Decision" value="Recommend revocation" detail="Evidence retained for audit" last/></div></div></div></section>

      <section id="architecture" className="border-y border-white/[0.07] bg-[#0b0c0f]"><div className="mx-auto max-w-[1220px] px-5 py-32 lg:px-8"><SectionIntro eyebrow="Architecture" title="Six specialized agents. One accountable control plane." text="Each agent has a narrow responsibility. The orchestrator connects their outputs into a decision that can be inspected instead of hiding the reasoning behind a single opaque score."/><div className="mt-16 grid overflow-hidden rounded-xl border border-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">{[
 {name:'IdentityAgent',sub:'Identity graph',text:'Who is acting, and what context belongs to them?',icon:Fingerprint},
 {name:'RiskAgent',sub:'Risk engine',text:'How dangerous is this access in context?',icon:Activity},
 {name:'PolicyAgent',sub:'Policy evaluation',text:'Does the requested access violate a control?',icon:ShieldCheck},
 {name:'DecisionAgent',sub:'Decision synthesis',text:'What should happen, and why?',icon:Sparkles},
 {name:'RemediationAgent',sub:'Action loop',text:'What safe next action closes the gap?',icon:GitBranch},
 {name:'AuditAgent',sub:'Evidence trail',text:'Can every decision be reconstructed later?',icon:Database}
].map(agent=>{const Icon=agent.icon;return <div key={agent.name} className="border-b border-r border-white/[0.07] p-6 last:border-b-0"><Icon className="h-4 w-4 text-white/45"/><div className="mt-6 font-mono text-[11px] text-white/35">{agent.name}</div><div className="mt-1 text-[14px] font-medium">{agent.sub}</div><p className="mt-3 text-[12px] leading-5 text-white/32">{agent.text}</p></div>})}</div></div></section>

      <section className="mx-auto max-w-[1220px] px-5 py-32 lg:px-8"><div className="grid gap-5 md:grid-cols-3">{[['Access reviews','Replace spreadsheet-driven access reviews with continuously evaluated identity context.'],['AI-agent governance','Treat autonomous agents as first-class identities with owners, privileges, and decision history.'],['Privileged access','Surface dangerous access changes before they become silent standing privilege.']].map(([t,d])=><div key={t} className="border-t border-white/[0.1] pt-5"><div className="text-[15px] font-medium">{t}</div><p className="mt-3 text-[13px] leading-6 text-white/35">{d}</p></div>)}</div></section>

      <section id="pricing" className="border-y border-white/[0.07] bg-[#0b0c0f]"><div className="mx-auto max-w-[1220px] px-5 py-32 lg:px-8"><SectionIntro eyebrow="Pricing" title="Start with the control plane. Grow into production." text="A simple entry point for teams exploring continuous identity evaluation, with room for deeper deployment and governance."/><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
 {name:'Free',price:'$0',sub:'Explore the model',items:['Identity posture','Decision trace','Local demo']},
 {name:'Pilot',price:'$29',sub:'per month · early access',items:['Everything in Free','Agent-aware identities','Remediation controls','Audit evidence'],featured:true},
 {name:'Growth',price:'$99',sub:'per month · for growing teams',items:['Everything in Pilot','Advanced policy controls','Team workspaces','Priority support']},
 {name:'Enterprise',price:'Custom',sub:'deployment & governance',items:['Custom integrations','Security requirements','Deployment support','Volume & SLA planning']}
].map(t=><div key={t.name} className={`relative rounded-xl border p-7 ${t.featured?'border-white/20 bg-white/[0.055]':'border-white/[0.08] bg-white/[0.018]'}`}>{t.featured&&<div className="absolute right-5 top-5 rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-white/45">Popular</div>}<div className="text-[13px] font-medium">{t.name}</div><div className="mt-6 text-4xl font-semibold tracking-[-.04em]">{t.price}</div><div className="mt-1 text-[11px] text-white/25">{t.sub}</div><ul className="mt-8 space-y-3">{t.items.map(x=><li key={x} className="flex gap-2 text-[12px] text-white/42"><Check className="mt-0.5 h-3.5 w-3.5 text-white/30"/>{x}</li>)}</ul></div>)}</div></div></section>

      <section className="mx-auto max-w-[1220px] px-5 py-28 text-center lg:px-8"><div className="mx-auto max-w-2xl"><div className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04]"><Network className="h-4 w-4 text-white/55"/></div><h2 className="mt-7 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">See the system make a decision.</h2><p className="mt-5 text-[15px] leading-7 text-white/38">Explore the live Steerpast IAM workspace and follow an identity from context to risk to an explainable action.</p><Link to="/demo" onClick={demo} className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[14px] font-medium text-black hover:bg-white/90">View demo <ArrowRight className="h-4 w-4"/></Link></div></section>
    </main>
    <footer className="border-t border-white/[0.07]"><div className="mx-auto flex max-w-[1220px] flex-col gap-4 px-5 py-8 text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 text-white/55"><SteerpastMark className="h-6 w-6"/>Steerpast IAM</div><div className="flex items-center gap-5"><span>Identity security for systems that can act on their own.</span><a href={contactHref} className="text-white/50 hover:text-white">Contact us</a></div></div></footer>
  </div>
);

const UsersIcon = Users;
function Users({className}:{className?:string}) { return <Fingerprint className={className}/>; }
