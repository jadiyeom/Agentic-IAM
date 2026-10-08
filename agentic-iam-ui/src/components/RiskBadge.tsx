import React from 'react';
import { riskTier, tierStyles } from './ui';

interface Props {
  score: number;
  anomaly: boolean;
}

export const RiskBadge: React.FC<Props> = ({ score, anomaly }) => {
  const tier = riskTier(score, anomaly);
  const s = tierStyles[tier];
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border py-1 pl-2 pr-2.5 text-[11px] font-medium ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      <span className="tabular-nums">{score}</span>
      <span className="opacity-70">{anomaly ? 'Anomaly' : s.label}</span>
    </span>
  );
};
