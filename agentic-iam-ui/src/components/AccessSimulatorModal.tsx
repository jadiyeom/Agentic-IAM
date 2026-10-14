import React, { useState } from 'react';
import { AccessRequestSimulation, assignRoleToIdentity, Role, simulateAccessRequest } from '../services/iamApi';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Gauge, Loader2, Play, ShieldAlert, Sparkles, X } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { Card, PageHeader } from './ui';

interface Props {
  identities: Array<{ id: string; name: string; title: string; risk: number; roles: string[] }>;
  roles: Role[];
  initialIdentityId?: string;
  onClose: () => void;
  onRoleGranted?: () => void;
}

export const AccessSimulatorModal: React.FC<Props> = ({
  identities,
  roles,
  initialIdentityId,
  onClose,
  onRoleGranted,
}) => {
  const [selectedIdentityId, setSelectedIdentityId] = useState(initialIdentityId || identities[0]?.id || '');
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [simulation, setSimulation] = useState<AccessRequestSimulation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grantedSuccess, setGrantedSuccess] = useState(false);

  const selectedIdentity = identities.find((i) => i.id === selectedIdentityId);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  async function handleSimulate() {
    if (!selectedIdentityId || !selectedRoleId) return;
    setLoading(true);
    setError(null);
    setGrantedSuccess(false);
    try {
      const res = await simulateAccessRequest({
        identityId: selectedIdentityId,
        roleId: selectedRoleId,
        justification: justification.trim() || undefined,
      });
      setSimulation(res);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to simulate access request');
    } finally {
      setLoading(false);
    }
  }

  async function handleGrant() {
    if (!selectedIdentityId || !selectedRoleId) return;
    setGranting(true);
    try {
      await assignRoleToIdentity(selectedIdentityId, selectedRoleId);
      setGrantedSuccess(true);
      if (onRoleGranted) onRoleGranted();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to grant role');
    } finally {
      setGranting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e12] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#b7ff49]/20 bg-[#b7ff49]/10 text-[#b7ff49]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Pre-Flight Access Request Simulator</h2>
              <p className="text-[12px] text-white/50">Run "What-If" policy & risk impact simulation before granting access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="scroll-quiet flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] p-3.5 text-[13px] text-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                Target Identity
              </label>
              <select
                value={selectedIdentityId}
                onChange={(e) => {
                  setSelectedIdentityId(e.target.value);
                  setSimulation(null);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#b7ff49]/50"
              >
                {identities.map((i) => (
                  <option key={i.id} value={i.id} className="bg-[#121317]">
                    {i.name} ({i.title}) - Risk: {i.risk}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                Requested Role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(e.target.value);
                  setSimulation(null);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#b7ff49]/50"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#121317]">
                    {r.name} [{r.sensitivity}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
              Business Justification (Optional)
            </label>
            <input
              type="text"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g., Temporary incident triage or emergency migration support"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#b7ff49]/50"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b7ff49] to-[#8fe024] px-4 py-2.5 text-[13px] font-medium text-black transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Pre-Flight Simulation
            </button>
          </div>

          {/* Simulation Results */}
          {simulation && (
            <div className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-white/40">Simulation Outcome</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${
                        simulation.recommendation === 'SAFE_TO_GRANT'
                          ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          : simulation.recommendation === 'NEEDS_MANAGER_APPROVAL'
                          ? 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                          : 'border border-red-400/30 bg-red-400/10 text-red-300'
                      }`}
                    >
                      {simulation.recommendation === 'SAFE_TO_GRANT' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {simulation.recommendation.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[12px] text-white/60">
                      Decision: <strong className="text-white">{simulation.decision.outcome}</strong> (
                      {Math.round(simulation.decision.confidence * 100)}% conf)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="block text-[11px] text-white/40">Baseline Risk</span>
                    <span className="text-[16px] font-semibold text-white/80">{simulation.baseline.riskScore}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30" />
                  <div>
                    <span className="block text-[11px] text-white/40">Projected Risk</span>
                    <span
                      className={`text-[18px] font-bold ${
                        simulation.projected.riskScore >= 70
                          ? 'text-red-400'
                          : simulation.projected.riskScore >= 40
                          ? 'text-amber-400'
                          : 'text-[#b7ff49]'
                      }`}
                    >
                      {simulation.projected.riskScore}
                      <span className="ml-1 text-[11px] font-normal text-white/50">
                        ({simulation.projected.riskDelta >= 0 ? '+' : ''}
                        {simulation.projected.riskDelta})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5 text-[12px] leading-relaxed text-white/75">
                <span className="font-semibold text-white">AI Agent Rationale: </span>
                {simulation.decision.rationale}
              </div>

              {/* Policy Violations */}
              <div>
                <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/60">
                  Projected Policy Findings ({simulation.projected.violations.length})
                </h4>
                {simulation.projected.violations.length === 0 ? (
                  <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] p-3 text-[12px] text-emerald-300">
                    No policy violations detected. This access request is strictly aligned with least privilege.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {simulation.projected.violations.map((v) => {
                      const isNew = simulation.projected.newViolations.some((nv) => nv.id === v.id);
                      return (
                        <li
                          key={v.id}
                          className={`flex items-start gap-3 rounded-xl border p-3 text-[12px] ${
                            isNew
                              ? 'border-red-400/30 bg-red-400/[0.07] text-red-200'
                              : 'border-white/10 bg-white/[0.02] text-white/70'
                          }`}
                        >
                          <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${isNew ? 'text-red-400' : 'text-amber-400'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] uppercase font-bold text-white/90">
                                {v.policyType}
                              </span>
                              {isNew && (
                                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                                  TRIGGERED BY REQUEST
                                </span>
                              )}
                              <span
                                className={`ml-auto text-[10px] font-semibold ${
                                  v.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                                }`}
                              >
                                {v.severity}
                              </span>
                            </div>
                            <p className="mt-1 leading-5 text-white/80">{v.description}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                <span className="text-[11px] text-white/40">
                  Target: {selectedIdentity?.name} → Role: {selectedRole?.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-white/10 px-4 py-2 text-[12px] text-white/70 hover:bg-white/[0.05] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGrant}
                    disabled={granting || grantedSuccess}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition ${
                      simulation.recommendation === 'SAFE_TO_GRANT'
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-amber-600 hover:bg-amber-500'
                    }`}
                  >
                    {granting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : grantedSuccess ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {grantedSuccess ? 'Granted Successfully' : 'Apply Role to Identity'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
