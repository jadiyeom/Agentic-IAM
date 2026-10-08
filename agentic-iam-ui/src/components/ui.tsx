import React from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, ShieldOff, Zap } from 'lucide-react';
import type { DecisionOutcome } from '../services/iamApi';
import { CountUp } from './motion';

/* ------------------------------------------------------------------ */
/* Shared workspace primitives. One visual language for every screen. */
/* ------------------------------------------------------------------ */

export type RiskTier = 'low' | 'medium' | 'high';

/** Mirrors agentic-iam-backend/src/riskTiers.ts (0–100 composite score). */
export const RISK_TIERS = { high: 50, medium: 25 } as const;

export function riskTier(score: number, anomaly = false): RiskTier {
  if (anomaly || score >= RISK_TIERS.high) return 'high';
  if (score >= RISK_TIERS.medium) return 'medium';
  return 'low';
}

export const tierStyles: Record<RiskTier, { dot: string; text: string; chip: string; bar: string; label: string }> = {
  low: { dot: 'bg-emerald-400', text: 'text-emerald-200', chip: 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200', bar: 'bg-emerald-400', label: 'Low' },
  medium: { dot: 'bg-amber-300', text: 'text-amber-200', chip: 'border-amber-300/25 bg-amber-300/[0.07] text-amber-200', bar: 'bg-amber-300', label: 'Medium' },
  high: { dot: 'bg-red-400', text: 'text-red-200', chip: 'border-red-400/30 bg-red-400/[0.08] text-red-200', bar: 'bg-red-400', label: 'High' },
};

const outcomeMeta: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  APPROVE: { label: 'Approved', cls: 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200', Icon: CheckCircle2 },
  FLAG_FOR_REVIEW: { label: 'Needs review', cls: 'border-amber-300/25 bg-amber-300/[0.07] text-amber-200', Icon: ClipboardList },
  RECOMMEND_REVOCATION: { label: 'Revoke recommended', cls: 'border-red-400/30 bg-red-400/[0.08] text-red-200', Icon: ShieldOff },
  AUTO_REMEDIATE: { label: 'Auto-remediated', cls: 'border-[#b7ff49]/25 bg-[#b7ff49]/[0.07] text-[#d0ff88]', Icon: Zap },
};

export function outcomeLabel(outcome?: DecisionOutcome | string | null) {
  const key = String(outcome || '').toUpperCase();
  return outcomeMeta[key]?.label ?? (key ? key.replace(/_/g, ' ').toLowerCase() : 'Pending');
}

export const OutcomeBadge: React.FC<{ outcome?: DecisionOutcome | string | null; className?: string }> = ({ outcome, className = '' }) => {
  const key = String(outcome || '').toUpperCase();
  const meta = outcomeMeta[key] ?? { label: outcomeLabel(outcome), cls: 'border-white/10 bg-white/[0.04] text-white/70', Icon: AlertTriangle };
  const { Icon } = meta;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.cls} ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
};

const sensitivityCls: Record<string, string> = {
  LOW: 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200',
  MEDIUM: 'border-amber-300/25 bg-amber-300/[0.06] text-amber-200',
  HIGH: 'border-orange-400/25 bg-orange-400/[0.07] text-orange-200',
  CRITICAL: 'border-red-400/30 bg-red-400/[0.08] text-red-200',
};

export const SensitivityBadge: React.FC<{ level: string }> = ({ level }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${sensitivityCls[level] ?? 'border-white/10 text-white/60'}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {level.toLowerCase()}
  </span>
);

export const Card: React.FC<{ className?: string; children: React.ReactNode; as?: 'div' | 'section' | 'aside' }> = ({ className = '', children, as: Tag = 'div' }) => (
  <Tag className={`rounded-2xl border border-white/[0.08] bg-[#0d0e10] ${className}`}>{children}</Tag>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode }> = ({ title, subtitle, icon, action }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
    <div className="flex min-w-0 items-start gap-3">
      {icon && <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60">{icon}</span>}
      <div className="min-w-0">
        <h2 className="text-[14px] font-medium text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] leading-5 text-white/50">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export const PageHeader: React.FC<{ eyebrow?: string; title: string; description: string; icon: React.ReactNode; actions?: React.ReactNode }> = ({ eyebrow, title, description, icon, actions }) => (
  <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-7 lg:flex-row lg:items-end lg:justify-between">
    <div className="flex items-start gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70">{icon}</div>
      <div>
        {eyebrow && <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{eyebrow}</div>}
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-white/55">{description}</p>
      </div>
    </div>
    {actions}
  </div>
);

export const StatCard: React.FC<{ label: string; value: React.ReactNode; detail?: string; icon?: React.ReactNode; tone?: 'default' | 'danger' | 'lime' }> = ({ label, value, detail, icon, tone = 'default' }) => {
  const valueCls = tone === 'danger' ? 'text-red-200' : tone === 'lime' ? 'text-[#d0ff88]' : 'text-white';
  const iconCls = tone === 'danger' ? 'text-red-300/80' : tone === 'lime' ? 'text-[#b7ff49]/80' : 'text-white/45';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0e10] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.16]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-white/55">{label}</span>
        {icon && <span className={iconCls}>{React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4', 'aria-hidden': true })}</span>}
      </div>
      <div className={`mt-3 text-[28px] font-semibold leading-none tracking-[-0.035em] tabular-nums ${valueCls}`}><CountUp value={value} /></div>
      {detail && <div className="mt-2 text-[11px] text-white/45">{detail}</div>}
    </div>
  );
};

export const Meter: React.FC<{ value: number; max?: number; className?: string; barClassName?: string; label?: string }> = ({ value, max = 100, className = '', barClassName = 'bg-[#b7ff49]', label }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${barClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Avatar: React.FC<{ name: string; tier?: RiskTier; size?: 'sm' | 'md' | 'lg' }> = ({ name, tier = 'low', size = 'md' }) => {
  const initials = name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const sz = size === 'lg' ? 'h-12 w-12 text-[14px] rounded-xl' : size === 'sm' ? 'h-8 w-8 text-[11px] rounded-lg' : 'h-9 w-9 text-[12px] rounded-lg';
  const tone = tier === 'high' ? 'border-red-400/30 bg-red-400/[0.08] text-red-100' : tier === 'medium' ? 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100' : 'border-white/10 bg-white/[0.05] text-white/75';
  return <span aria-hidden="true" className={`grid shrink-0 place-items-center border font-medium ${sz} ${tone}`}>{initials}</span>;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />
);

export const EmptyState: React.FC<{ title: string; text: string; icon?: React.ReactNode }> = ({ title, text, icon }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    {icon && <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50">{icon}</span>}
    <div className="text-[14px] font-medium text-white/80">{title}</div>
    <p className="mt-1.5 max-w-sm text-[12px] leading-5 text-white/50">{text}</p>
  </div>
);

export const providerLabel = (p?: string) => (p === 'claude' ? 'Claude' : p === 'huggingface' ? 'Hugging Face' : 'Deterministic heuristics');

export const humanize = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
