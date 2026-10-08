import React from 'react';

interface RiskLegendProps {
  className?: string;
}

const items = [
  ['bg-emerald-400', 'Low', '0–5'],
  ['bg-amber-300', 'Medium', '6–12'],
  ['bg-red-400', 'High', '13+'],
];

export const RiskLegend: React.FC<RiskLegendProps> = ({ className = '' }) => (
  <div className={`flex items-center gap-4 text-[11px] text-white/55 ${className}`} aria-label="Risk score legend">
    {items.map(([dot, label, range]) => (
      <span key={label} className="flex items-center gap-1.5">
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
        {label} <span className="tabular-nums text-white/40">{range}</span>
      </span>
    ))}
  </div>
);
