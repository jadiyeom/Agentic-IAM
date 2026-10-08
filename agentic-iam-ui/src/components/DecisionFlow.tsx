import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DecisionOutcome, RiskEvaluationResult, PolicyEvaluationResult } from '../services/iamApi';
import { Fingerprint, Activity, ShieldCheck, Sparkles, GitBranch } from 'lucide-react';
import { Card, CardHeader, OutcomeBadge, riskTier, tierStyles } from './ui';

interface Props {
  risk: RiskEvaluationResult | null;
  policy: PolicyEvaluationResult | null;
  decision: DecisionOutcome | null;
  subjectName?: string;
}

export const DecisionFlow: React.FC<Props> = ({ risk, policy, decision, subjectName }) => {
  const reduce = useReducedMotion();
  const violations = policy?.violations ?? [];
  const tier = riskTier(risk?.riskScore ?? 0);

  const stages = [
    { key: 'identity', agent: 'IdentityAgent', label: 'Context loaded', Icon: Fingerprint, done: !!risk },
    { key: 'risk', agent: 'RiskAgent', label: risk ? `Risk ${risk.riskScore} · ${tierStyles[tier].label}` : 'Scoring…', Icon: Activity, done: !!risk },
    { key: 'policy', agent: 'PolicyAgent', label: `${violations.length} violation${violations.length === 1 ? '' : 's'}`, Icon: ShieldCheck, done: !!policy },
    { key: 'decision', agent: 'DecisionAgent', label: decision ? 'Decision issued' : 'Pending', Icon: Sparkles, done: !!decision },
    { key: 'act', agent: 'RemediationAgent', label: 'Awaiting operator', Icon: GitBranch, done: false },
  ];

  return (
    <Card>
      <CardHeader
        icon={<Sparkles className="h-4 w-4" />}
        title="Decision pipeline"
        subtitle={subjectName ? `Latest evaluation for ${subjectName}` : 'Identity → risk → policy → decision → action'}
        action={decision ? <OutcomeBadge outcome={decision} /> : undefined}
      />
      <ol className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-5">
        {stages.map(({ key, agent, label, Icon, done }, i) => (
          <motion.li
            key={key}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={`relative rounded-xl border p-3.5 last:col-span-2 sm:last:col-span-1 ${done ? 'border-white/[0.1] bg-white/[0.025]' : 'border-dashed border-white/[0.1]'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-7 w-7 place-items-center rounded-lg border ${done ? 'border-[#b7ff49]/30 bg-[#b7ff49]/[0.08] text-[#b7ff49]' : 'border-white/10 text-white/45'}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="font-mono text-[10px] text-white/35">0{i + 1}</span>
            </div>
            <div className="mt-3 font-mono text-[11px] text-white/75">{agent}</div>
            <div className="mt-1 text-[11px] text-white/50">{label}</div>
          </motion.li>
        ))}
      </ol>
    </Card>
  );
};
