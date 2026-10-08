import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Clock, Cpu, Gauge, ListChecks, ShieldAlert, Timer, Undo2 } from 'lucide-react';
import { fetchAgentHealth, fetchAuditTimeline, fetchDecisionVolume, fetchMetrics, fetchRiskDistribution, Metrics } from '../services/iamApi';
import { Card, CardHeader, PageHeader, Skeleton, StatCard } from '../components/ui';

type Health = { status: string; lastRun: string; policiesLoaded: number; latency: number; decisionProvider?: string; model?: string | null };
type Dist = { low: number; medium: number; high: number };

const agents = ['IdentityAgent', 'RiskAgent', 'PolicyAgent', 'DecisionAgent', 'RemediationAgent', 'AuditAgent'];

export const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [dist, setDist] = useState<Dist | null>(null);
  const [volume, setVolume] = useState<{ day: string; count: number; outcome?: string }[]>([]);
  const [timeline, setTimeline] = useState<{ time: string; label: string }[]>([]);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(() => undefined);
    fetchAgentHealth().then(setHealth).catch(() => undefined);
    fetchRiskDistribution().then(setDist).catch(() => undefined);
    fetchDecisionVolume().then(setVolume).catch(() => undefined);
    fetchAuditTimeline().then(setTimeline).catch(() => undefined);
  }, []);

  const COLORS: Record<string, string> = { APPROVE: '#34d399', FLAG_FOR_REVIEW: '#fcd34d', RECOMMEND_REVOCATION: '#f87171', AUTO_REMEDIATE: '#b7ff49' };
  const mean = metrics && metrics.totalDecisions > 0 ? (metrics.cumulativeDecisionTimeMs / metrics.totalDecisions) : 0;
  const total = dist ? dist.low + dist.medium + dist.high : 0;
  const active = (health?.status ?? '').toLowerCase() === 'active';

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
      <div className="animate-rise">
        <PageHeader
          eyebrow="Workspace"
          title="System"
          description="Health of the agent pipeline and the volume and mix of decisions it is making."
          icon={<Activity className="h-5 w-5" />}
          actions={
            <span className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[12px] ${active ? 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200' : 'border-white/10 text-white/60'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]' : 'bg-white/40'}`} />
              {health ? `Pipeline ${health.status.toLowerCase()} · last run ${health.lastRun}` : 'Checking pipeline…'}
            </span>
          }
        />

        <div className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
          <StatCard label="Decisions made" value={metrics ? metrics.totalDecisions.toLocaleString() : '–'} detail="Since the service started" icon={<ListChecks />} />
          <StatCard label="Mean decision time" value={metrics ? `${mean < 1 ? mean.toFixed(2) : Math.round(mean)} ms` : '–'} detail="Full agent pipeline" icon={<Timer />} tone="lime" />
          <StatCard label="Policy violations" value={metrics ? metrics.policyViolationsDetected : '–'} detail={metrics ? `${metrics.anomaliesDetected} anomalies detected` : 'Detected so far'} icon={<ShieldAlert />} />
          <StatCard label="Human overrides" value={metrics ? metrics.decisionsOverridden : '–'} detail="Logged with a reason" icon={<Undo2 />} />
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid min-w-0 gap-4">
            <Card>
              <CardHeader icon={<Gauge className="h-4 w-4" />} title="Decision mix" subtitle="Latest decision for every identity" />
              <div className="h-[260px] px-3 pb-4 pt-5">
                {volume.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volume} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} width={44} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} contentStyle={{ background: '#111216', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} labelStyle={{ color: 'rgba(255,255,255,.6)' }} />
                      <Bar dataKey="count" name="Identities" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={700}>
                        {volume.map(v => <Cell key={v.day} fill={COLORS[v.outcome ?? ''] ?? '#b7ff49'} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <Skeleton className="h-full" />}
              </div>
            </Card>

            <Card>
              <CardHeader icon={<ShieldAlert className="h-4 w-4" />} title="Risk distribution" subtitle={dist ? `${total} identities currently evaluated` : 'Loading…'} />
              <div className="p-5">
                {dist ? (
                  <>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06]" role="img" aria-label={`Low ${dist.low}, medium ${dist.medium}, high ${dist.high}`}>
                      <div className="bg-emerald-400" style={{ width: `${(dist.low / Math.max(total, 1)) * 100}%` }} />
                      <div className="bg-amber-300" style={{ width: `${(dist.medium / Math.max(total, 1)) * 100}%` }} />
                      <div className="bg-red-400" style={{ width: `${(dist.high / Math.max(total, 1)) * 100}%` }} />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {([['Low', dist.low, 'bg-emerald-400'], ['Medium', dist.medium, 'bg-amber-300'], ['High', dist.high, 'bg-red-400']] as const).map(([l, n, c]) => (
                        <div key={l} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                          <div className="flex items-center gap-2 text-[12px] text-white/55"><span className={`h-2 w-2 rounded-full ${c}`} />{l}</div>
                          <div className="mt-1.5 text-[22px] font-semibold tabular-nums">{n}</div>
                          <div className="text-[11px] text-white/45">{total ? Math.round((n / total) * 100) : 0}%</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <Skeleton className="h-24" />}
              </div>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader icon={<Cpu className="h-4 w-4" />} title="Agents" subtitle={health ? `${health.policiesLoaded} policies · decisions by ${health.decisionProvider === 'claude' ? `Claude (${health.model})` : 'deterministic engine'}` : 'Loading…'} />
              <ul className="divide-y divide-white/[0.06]">
                {agents.map(a => (
                  <li key={a} className="flex items-center justify-between px-5 py-3">
                    <span className="font-mono text-[12px] text-white/75">{a}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] ${active ? 'text-emerald-200' : 'text-white/50'}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-white/40'}`} />{active ? 'Healthy' : 'Unknown'}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader icon={<Clock className="h-4 w-4" />} title="Latest evaluation" subtitle="The most recent pipeline run" />
              <ol className="relative px-5 py-4">
                {timeline.length ? timeline.map((t, i) => (
                  <li key={i} className="relative flex gap-4 pb-4 last:pb-0">
                    {i < timeline.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-white/10" aria-hidden="true" />}
                    <span className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${i === timeline.length - 1 ? 'border-[#b7ff49] bg-[#b7ff49]/30' : 'border-white/25 bg-[#0d0e10]'}`} aria-hidden="true" />
                    <div className="flex flex-1 items-baseline justify-between gap-3">
                      <span className="text-[13px] text-white/80">{t.label}</span>
                      <span className="font-mono text-[11px] text-white/45">{/^\d{4}-/.test(t.time) ? new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : t.time}</span>
                    </div>
                  </li>
                )) : <Skeleton className="h-28" />}
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
