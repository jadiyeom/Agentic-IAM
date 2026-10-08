import React from 'react';
import { PublicLayout } from './PublicLayout';

export const Terms: React.FC = () => (
  <PublicLayout
    eyebrow="Legal"
    title="Terms"
    intro="Steerpast is provided as an early-stage product and evaluation surface. Use of the public demo is subject to these basic terms."
  >
    <div className="surface-soft rounded-[22px] border border-white/[0.08] p-7 text-[13px] leading-7 text-white/65">
      <h2 className="text-[17px] font-medium text-white">Demo use</h2>
      <p className="mt-3">The public environment is for evaluation and demonstration. Do not enter production secrets, customer identity data, or other sensitive information into the demo.</p>
      <h2 className="mt-8 text-[17px] font-medium text-white">No production guarantee</h2>
      <p className="mt-3">The public site and repository describe an early-stage implementation and do not constitute a guarantee of production security, availability, compliance, or fitness for a particular purpose.</p>
      <h2 className="mt-8 text-[17px] font-medium text-white">Changes</h2>
      <p className="mt-3">These terms may be updated as the product and company develop.</p>
    </div>
  </PublicLayout>
);
