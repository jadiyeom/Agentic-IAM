import React from 'react';
import { Database, EyeOff, KeyRound, LockKeyhole, UsersRound } from 'lucide-react';
import { PublicLayout } from './PublicLayout';

const controls = [
  ['Public demo isolation', 'The public demo uses seeded/sample identities and roles. It does not ask visitors to connect a real identity provider.', Database],
  ['Server-side credentials', 'The Anthropic key is read by the backend from ANTHROPIC_API_KEY. Browser code does not need the API credential.', KeyRound],
  ['Decision validation', 'Model responses are validated before they are exposed as a decision. Supported outcomes, rationale and confidence are checked.', LockKeyhole],
  ['Human authority', 'Sensitive remediation actions remain operator-controlled. Review, revoke, and override actions are explicit and auditable.', UsersRound],
  ['Explainability', 'The system keeps the contributing risk/policy context and a decision rationale so an operator can inspect why an outcome occurred.', EyeOff],
];

export const Security: React.FC = () => (
  <PublicLayout
    eyebrow="Security & trust"
    title="Security decisions should be inspectable by design."
    intro="Steerpast is an early-stage product. This page describes the controls implemented in the public codebase and demo rather than claiming certifications or production guarantees that do not yet exist."
  >
    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">
      {controls.map(([title,text,Icon]) => {
        const I = Icon as React.ElementType;
        return (
          <div key={title as string} className="bg-[#0b0c0d] p-7">
            <I className="h-4 w-4 text-white/65"/>
            <h2 className="mt-5 text-[14px] font-medium">{title as string}</h2>
            <p className="mt-2 max-w-3xl text-[12px] leading-6 text-white/50">{text as string}</p>
          </div>
        );
      })}
    </div>

    <div className="mt-8 rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-7">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/50">Current status</div>
      <p className="mt-3 text-[12px] leading-6 text-white/50">Steerpast does not currently claim SOC 2, ISO 27001, or another external certification on this site. As production adoption grows, formal security controls and independent assurance can be added alongside customer requirements.</p>
    </div>
  </PublicLayout>
);
