import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ShieldCheck, Activity, Lock, GitBranch, Eye, AlertTriangle, Check, ChevronRight, Database, KeyRound, Sparkles } from 'lucide-react';

const demo = () => localStorage.setItem('trustlens-iam-auth', 'true');

export const Landing: React.FC = () => (
  <div className="landing-page min-h-screen bg-[#08090b] text-[#f7f7f8] selection:bg-white/20">
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#08090b]/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 lg:px-8">
        <a href="#" className="flex items-center gap-2.5 text-[15px] font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-white/[0.06]"><ShieldCheck className="h-4 w-4" /></span>
          TrustLens
        </a>
        <div className="hidden items-center gap-7 text-[13px] text-white/55 md:flex">
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#how-it-works" className="hover:text-white">How it works</a>
          <a href="#use-cases" className="hover:text-white">Use cases</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </div>
        <Link to="/demo" onClick={demo} className="group inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[13px] font-medium hover:border-white/25 hover:bg-white/[0.1]">
          View demo <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </header>

    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(120,119,255,0.12),transparent_62%)]" />
        <div className="relative mx-auto max-w-[1180px] px-5 pb-28 pt-28 text-center lg:px-8 lg:pt-36">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[13px] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />Identity security for the agentic era
          </div>
          <h1 className="mx-auto max-w-4xl text-[48px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
            Security for identities<br /><span className="text-white/45">that can act on their own.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-7 text-white/50">
            TrustLens gives security teams a live map of human and AI-agent access, evaluates risky changes, explains decisions, and turns findings into auditable remediation.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/demo" onClick={demo} className="group inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-[14px] font-medium text-black shadow-[0_0_30px_rgba(255,255,255,.08)] hover:bg-white/90">
              View demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#product" className="inline-flex h-11 items-center rounded-lg border border-white/10 px-5 text-[14px] font-medium text-white/65 hover:border-white/20 hover:text-white">Explore the product</a>
          </div>

          <div className="product-preview mx-auto mt-20 max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] text-left shadow-[0_40px_120px_rgba(0,0,0,.5)]">
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] px-4">
              <span className="h-2 w-2 rounded-full bg-white/15" /><span className="h-2 w-2 rounded-full bg-white/15" /><span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="ml-3 text-[12px] text-white/30">TrustLens / Security overview</span>
            </div>
            <div className="grid min-h-[350px] md:grid-cols-[190px_1fr]">
              <aside className="hidden border-r border-white/[0.06] p-4 md:block">
                <div className="mb-5 text-[12px] font-semibold text-white/75">TrustLens</div>
                {['Overview','Identities','Entitlements','Audit trail','System'].map((x,i) => (
                  <div key={x} className={`mb-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[12px] ${i===0?'bg-white/[0.08] text-white':'text-white/35'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />{x}
                  </div>
                ))}
              </aside>
              <div className="p-5 md:p-7">
                <div className="flex items-start justify-between">
                  <div><div className="text-[12px] text-white/35">Security overview</div><div className="mt-1 text-lg font-medium">Access posture</div></div>
                  <div className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] text-emerald-300">Monitoring active</div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Metric label="Identities" value="1,284" delta="+24 this week" />
                  <Metric label="High-risk access" value="17" delta="5 need review" danger />
                  <Metric label="Decisions" value="98.7%" delta="policy evaluated" />
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.3fr_.7fr]">
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-4">
                    <div className="flex justify-between text-[10px] text-white/35"><span>Recent decisions</span><span>Live</span></div>
                    {[
                      ['deployment-intern','production-db.admin','Revocation recommended','red'],
                      ['release-agent','payments.read','Allowed','green'],
                      ['support-agent','customer.export','Step-up required','amber']
                    ].map(([a,b,c,color]) => (
                      <div key={a} className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                        <div><div className="text-[12px] text-white/75">{a}</div><div className="mt-1 text-[10px] text-white/30">{b}</div></div>
                        <span className={`text-[10px] ${color==='red'?'text-red-300':color==='green'?'text-emerald-300':'text-amber-300'}`}>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-4">
                    <div className="text-[10px] text-white/35">Risk distribution</div>
                    <div className="mt-5 flex h-28 items-end gap-2">
                      {[28,42,34,55,45,68,52,76,61,88,70,82].map((h,i)=><div key={i} className="flex-1 rounded-t-sm bg-white/[0.12]" style={{height:`${h}%`}} />)}
                    </div>
                    <div className="mt-2 flex justify-between text-[9px] text-white/25"><span>Mon</span><span>Today</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <Stat icon={<Eye />} title="See" text="Know who has access, including autonomous agents and service identities." />
            <Stat icon={<Activity />} title="Understand" text="Evaluate risk and policy together instead of reviewing disconnected alerts." />
            <Stat icon={<Lock />} title="Act" text="Move from detection to a defensible remediation decision with evidence." />
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
        <SectionIntro eyebrow="The product" title="A security control plane for identity decisions." text="TrustLens sits between identity data and sensitive actions. It turns raw access changes into decisions your security team can understand, review, and audit." />
        <div className="mt-16 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          <ProductRow number="01" icon={<Bot />} title="Agent-aware identity" text="Model AI agents like real identities. Track their owner, role, entitlements, environment, and behavior so an agent never becomes an invisible privileged user." items={['Human, service, and AI-agent identities','Entitlement and privilege context','Owner and environment awareness']} />
          <ProductRow number="02" icon={<ShieldCheck />} title="Risk + policy evaluation" text="Combine deterministic controls with contextual risk signals. A permission is not simply good or bad—the decision depends on who requested it, what they can reach, and why." items={['Privilege escalation detection','Policy conflict evaluation','Blast-radius and sensitivity context']} />
          <ProductRow number="03" icon={<Sparkles />} title="Explainable decisions" text="Every important decision gets a human-readable explanation. Security operators can see the evidence behind an allow, deny, review, or revoke recommendation." items={['Decision reasoning','Evidence and contributing signals','Operator-friendly audit narrative']} />
          <ProductRow number="04" icon={<GitBranch />} title="Remediation loop" text="Close the gap between finding a problem and fixing it. TrustLens turns high-risk access into a proposed action while preserving the original evidence and decision." items={['Revocation recommendations','Review workflows','Immutable decision trail']} />
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/[0.07] bg-[#0b0c0f]">
        <div className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
          <SectionIntro eyebrow="How it works" title="From access change to accountable decision." text="The system is intentionally simple: observe the identity, understand the access, evaluate the risk, explain the decision, then create a remediation path." />
          <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-5">
            {[
              ['01','Observe','IdentityAgent','Collect identity and entitlement context.'],
              ['02','Assess','RiskAgent','Score privilege, sensitivity, and behavioral risk.'],
              ['03','Evaluate','PolicyAgent','Check policies and access constraints.'],
              ['04','Decide','DecisionAgent','Produce an explainable security decision.'],
              ['05','Act','RemediationAgent','Recommend or execute the next safe action.']
            ].map(([n,t,a,d]) => (
              <div key={n} className="bg-[#0b0c0f] p-6 md:min-h-[245px]">
                <div className="text-[12px] text-white/25">{n}</div><div className="mt-12 text-[15px] font-medium">{t}</div>
                <div className="mt-2 font-mono text-[10px] text-white/35">{a}</div><p className="mt-4 text-[13px] leading-5 text-white/40">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">A concrete decision</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">An intern gets production admin access.</h2>
            <p className="mt-6 text-[15px] leading-7 text-white/45">This is where traditional IAM dashboards stop. TrustLens follows the access change all the way through to a security decision.</p>
            <Link to="/demo" onClick={demo} className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-white hover:text-white/70">Open this scenario <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0c0f]">
            <div className="border-b border-white/[0.07] px-5 py-4 text-[12px] text-white/35">Decision trace · 14:32:08 UTC</div>
            <div className="space-y-0 px-5">
              <Trace icon={<Bot />} label="Identity" value="deployment-intern" detail="Human identity · Engineering · Intern" />
              <Trace icon={<KeyRound />} label="Access change" value="production-db.admin" detail="New privileged entitlement detected" />
              <Trace icon={<AlertTriangle />} label="Risk" value="High · 92 / 100" detail="Production data + privilege escalation" />
              <Trace icon={<ShieldCheck />} label="Policy" value="Conflict detected" detail="Intern role cannot hold production admin access" />
              <Trace icon={<Check />} label="Decision" value="Recommend revocation" detail="Evidence retained for audit" last />
            </div>
          </div>
        </div>
      </section>

      <section id="use-cases" className="border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
          <SectionIntro eyebrow="Use cases" title="Built for the access problems created by modern software." text="One control plane for the identity events that matter most as humans, services, and AI agents share the same systems." />
          <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
            <UseCase icon={<Bot />} title="AI agents" text="Give autonomous agents explicit identities, bounded permissions, and decisions that can be inspected after the fact." />
            <UseCase icon={<Database />} title="Privileged access" text="Detect privilege escalation before sensitive databases, production systems, or customer data are exposed." />
            <UseCase icon={<Activity />} title="Continuous access review" text="Replace periodic spreadsheets with a continuously evaluated view of identity risk and entitlement drift." />
            <UseCase icon={<Eye />} title="Security investigations" text="Start with a suspicious identity or entitlement and follow the complete decision trail to its evidence." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <div><p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">Why TrustLens</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">IAM tells you what exists. TrustLens tells you what should happen.</h2></div>
          <div className="space-y-9">
            <Reason title="Context over alerts" text="Access decisions combine identity, entitlement, sensitivity, policy, and risk context instead of producing another disconnected alert queue." />
            <Reason title="Agents are first-class" text="AI agents increasingly operate with credentials and permissions. TrustLens treats them as identities that need ownership, policy, and accountability." />
            <Reason title="Explainability is part of the control" text="A security action without an explanation is difficult to trust. Decisions carry evidence so an operator can understand why the system recommended them." />
            <Reason title="Designed for a small security team" text="Automation handles repetitive evaluation while humans retain the final authority over sensitive remediation." />
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#0b0c0f]">
        <div className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
          <SectionIntro eyebrow="Architecture" title="A decision system, not another dashboard." text="TrustLens separates identity context, risk analysis, policy evaluation, decisioning, remediation, and audit so each part can be inspected independently." />
          <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['IdentityAgent','Identity + entitlement context'],['RiskAgent','Risk scoring + blast radius'],['PolicyAgent','Policy and constraint evaluation'],
              ['DecisionAgent','Explainable final decision'],['RemediationAgent','Safe corrective action'],['AuditAgent','Evidence + decision history']
            ].map(([a,b],i)=>(
              <div key={a} className="flex items-start gap-4 rounded-lg border border-white/[0.07] bg-white/[0.018] p-5">
                <span className="font-mono text-[10px] text-white/25">0{i+1}</span><div><div className="text-[13px] font-medium">{a}</div><div className="mt-1 text-[12px] text-white/35">{b}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-32 lg:px-8">
        <SectionIntro eyebrow="Pricing" title="Start small. Prove the workflow." text="Early access is intentionally simple while the product is being validated with security teams." />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Price title="Free" price="$0" text="Explore the core workflow." items={['Demo security console','Sample identities','Decision trace']} />
          <Price featured title="Pilot" price="$29" suffix="/ month" text="For teams validating agentic IAM." items={['Continuous identity evaluation','Risk + policy decisions','Explainability and audit','Remediation workflow']} />
          <Price title="Enterprise" price="Custom" text="For production security programs." items={['Custom integrations','Deployment support','Security requirements','Volume and SLA planning']} />
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-[900px] px-5 py-36 text-center lg:px-8">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"><ShieldCheck className="h-5 w-5" /></div>
          <h2 className="mt-7 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Make every identity decision explainable.</h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-white/45">See the product in action with a realistic access-risk scenario. No signup required.</p>
          <Link to="/demo" onClick={demo} className="mt-9 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-[14px] font-medium text-black hover:bg-white/90">View demo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>

    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-8 text-[13px] text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2 text-white/55"><ShieldCheck className="h-4 w-4" />TrustLens</div><div>Agentic identity security · Early access</div>
      </div>
    </footer>
  </div>
);

function SectionIntro({eyebrow,title,text}:{eyebrow:string;title:string;text?:string}) {
  return <div className="max-w-2xl"><p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">{eyebrow}</p><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">{title}</h2>{text && <p className="mt-5 text-[15px] leading-7 text-white/45">{text}</p>}</div>;
}
function Metric({label,value,delta,danger}:{label:string;value:string;delta:string;danger?:boolean}) {
  return <div className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-4"><div className="text-[10px] text-white/35">{label}</div><div className={`mt-2 text-xl font-medium ${danger?'text-red-300':'text-white'}`}>{value}</div><div className="mt-1 text-[9px] text-white/25">{delta}</div></div>;
}
function Stat({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div className="flex gap-3"><span className="text-white/45">{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4'})}</span><div><div className="text-[13px] font-medium">{title}</div><p className="mt-1 text-[13px] leading-5 text-white/35">{text}</p></div></div>;
}
function ProductRow({number,icon,title,text,items}:{number:string;icon:React.ReactNode;title:string;text:string;items:string[]}) {
  return <div className="grid gap-8 py-12 md:grid-cols-[70px_1fr_1fr] md:items-start"><div className="font-mono text-[12px] text-white/25">{number}</div><div><div className="flex items-center gap-3"><span className="text-white/50">{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4'})}</span><h3 className="text-lg font-medium">{title}</h3></div><p className="mt-4 max-w-xl text-[14px] leading-6 text-white/42">{text}</p></div><div className="md:pt-1">{items.map(x=><div key={x} className="flex gap-2 border-b border-white/[0.05] py-2.5 text-[13px] text-white/45"><ChevronRight className="mt-0.5 h-3 w-3 text-white/25" />{x}</div>)}</div></div>;
}
function Trace({icon,label,value,detail,last}:{icon:React.ReactNode;label:string;value:string;detail:string;last?:boolean}) {
  return <div className={`flex gap-4 py-5 ${last?'':'border-b border-white/[0.05]'}`}><div className="mt-0.5 text-white/40">{React.cloneElement(icon as React.ReactElement,{className:'h-4 w-4'})}</div><div className="min-w-0 flex-1"><div className="text-[10px] uppercase tracking-wider text-white/25">{label}</div><div className="mt-1 text-[13px] font-medium">{value}</div><div className="mt-1 text-[12px] text-white/35">{detail}</div></div></div>;
}
function UseCase({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div className="bg-[#0b0c0f] p-8"><div className="text-white/45">{React.cloneElement(icon as React.ReactElement,{className:'h-5 w-5'})}</div><h3 className="mt-10 text-[15px] font-medium">{title}</h3><p className="mt-3 max-w-md text-[13px] leading-6 text-white/40">{text}</p></div>;
}
function Reason({title,text}:{title:string;text:string}) {
  return <div><h3 className="text-[14px] font-medium">{title}</h3><p className="mt-2 text-[13px] leading-6 text-white/40">{text}</p></div>;
}
function Price({title,price,suffix,text,items,featured}:{title:string;price:string;suffix?:string;text:string;items:string[];featured?:boolean}) {
  return <div className={`relative rounded-xl border p-7 ${featured?'border-white/20 bg-white/[0.055]':'border-white/[0.08] bg-white/[0.018]'}`}>
    {featured && <div className="absolute right-5 top-5 rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-white/45">Early access</div>}
    <div className="text-[13px] font-medium">{title}</div><div className="mt-7 text-4xl font-semibold tracking-[-0.04em]">{price}<span className="text-sm font-normal text-white/30">{suffix}</span></div>
    <p className="mt-3 min-h-10 text-[13px] leading-5 text-white/35">{text}</p>
    <div className="mt-7 border-t border-white/[0.07] pt-5">{items.map(x=><div key={x} className="flex gap-2 py-1.5 text-[12px] text-white/45"><Check className="h-3.5 w-3.5 text-white/45" />{x}</div>)}</div>
  </div>;
}
