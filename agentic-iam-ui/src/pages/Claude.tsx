import React from 'react';
import { ArrowDown, CheckCircle2, Cpu, Database, FileCheck2, GitBranch, ShieldCheck } from 'lucide-react';
import { PublicLayout } from './PublicLayout';

const steps = [
  ['01', 'Identity context', 'Owner, role, entitlements, department, environment and identity type are assembled before model reasoning.'],
  ['02', 'Risk + policy', 'Deterministic risk scoring and policy evaluation establish the constraints Claude must reason within.'],
  ['03', 'Claude decisioning', 'DecisionAgent can send the structured security context to Claude and request one supported outcome, a rationale and confidence.'],
  ['04', 'Validation', 'The response is parsed and validated: outcome must be supported, rationale must be non-empty, and confidence must be numeric and bounded.'],
  ['05', 'Remediation + audit', 'The resulting decision flows into remediation controls while preserving the evidence and decision provider for inspection.'],
];

export const Claude: React.FC = () => (
  <PublicLayout
    eyebrow="Claude integration"
    title="Model reasoning where identity decisions need context."
    intro="Steerpast separates deterministic security signals from model reasoning. Claude is integrated at the DecisionAgent layer rather than being used as an opaque replacement for identity, risk, or policy controls."
  >
    <div className="grid gap-4 lg:grid-cols-5">
      {steps.map(([n,title,text], i) => (
        <React.Fragment key={n}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 lg:min-h-[270px]">
            <div className="font-mono text-[9px] text-white/20">{n}</div>
            <div className="mt-10 flex items-center gap-2"><Cpu className="h-4 w-4 text-[#b7ff49]/70"/><h2 className="text-[13px] font-medium">{title}</h2></div>
            <p className="mt-4 text-[11px] leading-5 text-white/30">{text}</p>
          </div>
          {i < steps.length - 1 && <ArrowDown className="mx-auto my-[-4px] h-4 w-4 text-white/15 lg:hidden" />}
        </React.Fragment>
      ))}
    </div>

    <div className="mt-12 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-[#b7ff49]/15 bg-[#b7ff49]/[0.025] p-7">
        <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-[#b7ff49]"/><h2 className="text-[15px] font-medium">Why Claude is in the loop</h2></div>
        <p className="mt-4 text-[12px] leading-6 text-white/32">Risk and policy engines provide structured constraints. Claude adds contextual synthesis and a human-readable rationale so an operator can understand why the final outcome was selected.</p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7">
        <div className="flex items-center gap-3"><Database className="h-4 w-4 text-white/45"/><h2 className="text-[15px] font-medium">What gets returned</h2></div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Outcome','Rationale','Confidence'].map(x=><div key={x} className="rounded-lg border border-white/[0.07] bg-black/10 px-3 py-3 text-center text-[10px] text-white/45">{x}</div>)}
        </div>
      </div>
    </div>

    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7">
        <div className="flex items-center gap-3"><FileCheck2 className="h-4 w-4 text-white/45"/><h2 className="text-[15px] font-medium">Guardrails in code</h2></div>
        <ul className="mt-4 space-y-3 text-[11px] leading-5 text-white/30">
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-[#b7ff49]/60"/>Supported outcomes are explicitly enumerated.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-[#b7ff49]/60"/>Malformed model output cannot silently become a valid decision.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-[#b7ff49]/60"/>Confidence is clamped to the 0–1 range.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-[#b7ff49]/60"/>Failed Claude calls fall back to deterministic heuristics.</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7">
        <div className="flex items-center gap-3"><GitBranch className="h-4 w-4 text-white/45"/><h2 className="text-[15px] font-medium">Model selection</h2></div>
        <p className="mt-4 text-[11px] leading-5 text-white/30">The backend uses the <code className="rounded bg-white/[0.06] px-1 py-0.5 text-white/60">ANTHROPIC_MODEL</code> environment variable when present, with <code className="rounded bg-white/[0.06] px-1 py-0.5 text-white/60">claude-sonnet-4-5</code> as the configured alias in this project.</p>
        <p className="mt-3 text-[10px] text-white/20">The public site does not embed API credentials. Production deployment should configure the key on the server.</p>
      </div>
    </div>
  </PublicLayout>
);
