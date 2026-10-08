import React from 'react';
import { ArrowUpRight, Github, Mail } from 'lucide-react';
import { PublicLayout } from './PublicLayout';

const contactHref = 'mailto:' + ['omjadiye','steerpast.com'].join('@');

export const Company: React.FC = () => (
  <PublicLayout
    eyebrow="Company"
    title="Early-stage, product-first, and focused on agentic identity security."
    intro="Steerpast is building identity security for systems where humans, services, and AI agents increasingly act with real permissions. The product is intentionally public enough to inspect: the demo, architecture, and implementation are available for review."
  >
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7">
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">What we are building</div>
        <h2 className="mt-5 text-[18px] font-medium">An identity decision control plane for the agentic era.</h2>
        <p className="mt-4 text-[12px] leading-6 text-white/50">Steerpast connects identity context, contextual risk, policy evaluation, model-assisted decisioning, remediation, and audit evidence in a single workflow.</p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7">
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Current stage</div>
        <h2 className="mt-5 text-[18px] font-medium">Early access / validation</h2>
        <p className="mt-4 text-[12px] leading-6 text-white/50">The public environment is a product demonstration and evaluation surface. The site focuses on verifiable product, architecture, and implementation evidence while the business is in early validation.</p>
      </div>
    </div>

    <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Open source surface</div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-[12px] leading-6 text-white/50">Review the implementation, deployment configuration, and Claude decision path directly in the public repository.</p>
        <a href="https://github.com/jadiyeom/Agentic-IAM" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[12px] text-white/55 hover:border-white/20 hover:text-white"><Github className="h-3.5 w-3.5"/>GitHub <ArrowUpRight className="h-3.5 w-3.5"/></a>
      </div>
    </div>

    <div id="contact" className="mt-4 rounded-2xl border border-[#b7ff49]/15 bg-[#b7ff49]/[0.025] p-7">
      <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#b7ff49]"/><h2 className="text-[15px] font-medium">Talk to Steerpast</h2></div>
      <p className="mt-3 text-[12px] leading-6 text-white/50">For product discussions, pilots, security questions, or partnership conversations, contact the team through the company-domain email.</p>
      <a href={contactHref} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b7ff49] px-4 py-2 text-[12px] font-semibold text-[#08090a]">Contact us <ArrowUpRight className="h-3.5 w-3.5"/></a>
    </div>
  </PublicLayout>
);
