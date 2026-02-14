import React from 'react';

interface RiskLegendProps {
  className?: string;
}

export const RiskLegend: React.FC<RiskLegendProps> = ({ className = '' }) => (
  <div className={`flex items-center gap-4 text-xs ${className}`}>
    <span className="flex items-center gap-1">
      <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" /> Low (0–5)
    </span>
    <span className="flex items-center gap-1">
      <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" /> Medium (6–12)
    </span>
    <span className="flex items-center gap-1">
      <span className="inline-block h-3 w-3 rounded-full bg-red-400" /> High (13+)
    </span>
  </div>
);
