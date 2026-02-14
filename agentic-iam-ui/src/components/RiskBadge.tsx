import React from 'react';

interface Props {
  score: number;
  anomaly: boolean;
}

function riskColor(score: number): string {
  if (score >= 80) return 'bg-red-500/20 text-red-300 border-red-400';
  if (score >= 60) return 'bg-orange-500/20 text-orange-300 border-orange-400';
  if (score >= 40) return 'bg-yellow-500/20 text-yellow-200 border-yellow-400';
  return 'bg-emerald-500/15 text-emerald-200 border-emerald-400';
}

export const RiskBadge: React.FC<Props> = ({ score, anomaly }) => {
  const label = anomaly ? 'Anomaly' : 'Normal';
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${riskColor(
          score
        )}`}
      >
        Risk {score}
      </span>
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
          anomaly ? 'border-danger text-danger bg-danger/10' : 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

