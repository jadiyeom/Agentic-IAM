import React from 'react';

interface Props {
  score: number;
  anomaly: boolean;
}

function riskColor(score: number, anomaly: boolean): string {
  if (anomaly || score >= 13) return 'bg-red-400/[0.10] text-red-200 border-red-400/45';
  if (score >= 6) return 'bg-amber-300/[0.10] text-amber-200 border-amber-300/40';
  return 'bg-emerald-400/[0.08] text-emerald-200 border-emerald-400/35';
}

export const RiskBadge: React.FC<Props> = ({ score, anomaly }) => {
  const label = anomaly ? 'Anomaly' : score >= 13 ? 'High' : score >= 6 ? 'Medium' : 'Low';
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${riskColor(score, anomaly)}`}
      >
        Risk {score}
      </span>
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
          anomaly || score >= 13 ? 'border-red-400/35 text-red-200 bg-red-400/[0.08]' : score >= 6 ? 'border-amber-300/30 text-amber-200 bg-amber-300/[0.07]' : 'border-emerald-400/30 text-emerald-200 bg-emerald-500/[0.07]'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

