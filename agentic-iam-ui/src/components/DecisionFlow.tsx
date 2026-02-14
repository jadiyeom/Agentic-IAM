import React from 'react';
import { motion } from 'framer-motion';
import { DecisionOutcome, RiskEvaluationResult, PolicyEvaluationResult } from '../services/iamApi';
import { Activity, GitBranch, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

interface Props {
  risk: RiskEvaluationResult | null;
  policy: PolicyEvaluationResult | null;
  decision: DecisionOutcome | null;
}

export const DecisionFlow: React.FC<Props> = ({ risk, policy, decision }) => {
  const violations = policy?.violations ?? [];
  const criticalCount = violations.filter((v) => v.severity === 'CRITICAL').length;

  const riskData = [
    {
      name: 'Risk',
      value: risk?.riskScore ?? 0,
      fill: (risk?.riskScore ?? 0) >= 70 ? '#fb7185' : (risk?.riskScore ?? 0) >= 40 ? '#facc15' : '#4ade80',
    },
  ];

  const stages = [
    { key: 'identity', label: 'Identity Context', icon: Activity },
    { key: 'risk', label: 'Risk Evaluation', icon: GitBranch },
    { key: 'policy', label: 'Policy Compliance', icon: ShieldAlert },
    { key: 'decision', label: 'Decision & Action', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-surfaceAlt/80 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">Decision Flow</h3>
          <p className="text-xs text-slate-400">
            Identity → Risk → Policy → Decision. Animated to reflect current evaluation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={riskData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={999} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Risk Score</div>
            <div className="text-lg font-semibold text-slate-50">
              {risk ? risk.riskScore : '--'}
              <span className="text-xs text-slate-500"> / 100</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {violations.length} violation(s), {criticalCount} critical
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-2 flex items-center justify-between gap-2">
        <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700" />
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive =
            (idx === 0 && !!risk) ||
            (idx === 1 && !!risk) ||
            (idx === 2 && violations.length > 0) ||
            (idx === 3 && !!decision);
          return (
            <motion.div
              key={stage.key}
              className="relative z-10 flex flex-col items-center gap-1"
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: isActive ? 1 : 0.55, y: isActive ? 0 : 4, scale: isActive ? 1.03 : 1 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-slate-100 ${
                  isActive
                    ? 'border-accent bg-accent/20 shadow-[0_0_20px_rgba(56,189,248,0.45)]'
                    : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">{stage.label}</span>
            </motion.div>
          );
        })}
      </div>

      {decision && (
        <div className="mt-1 rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-100">Decision</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
              {decision}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

