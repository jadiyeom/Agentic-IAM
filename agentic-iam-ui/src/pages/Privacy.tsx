import React from 'react';
import { PublicLayout } from './PublicLayout';

export const Privacy: React.FC = () => (
  <PublicLayout
    eyebrow="Legal"
    title="Privacy"
    intro="Steerpast is an early-stage product. This page describes the basic privacy posture of the public website and demo."
  >
    <div className="surface-soft rounded-[22px] border border-white/[0.08] p-7 text-[13px] leading-7 text-white/65">
      <h2 className="text-[17px] font-medium text-white">Public demo</h2>
      <p className="mt-3">The hosted demo uses seeded/sample identity and entitlement data. Visitors are not asked to connect a production identity provider.</p>
      <h2 className="mt-8 text-[17px] font-medium text-white">Credentials</h2>
      <p className="mt-3">API credentials used by the application are intended to remain on the server and are not embedded in browser code.</p>
      <h2 className="mt-8 text-[17px] font-medium text-white">Contact</h2>
      <p className="mt-3">Questions about privacy can be sent through the contact option on the Company page.</p>
    </div>
  </PublicLayout>
);
