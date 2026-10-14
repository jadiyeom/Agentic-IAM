import React, { useEffect, useMemo, useState } from 'react';
import {
  createPolicy,
  deletePolicy,
  fetchIdentities,
  fetchPolicies,
  fetchRoles,
  IdentityViewModel,
  Policy,
  PolicyType,
  Role,
  updatePolicy,
} from '../services/iamApi';
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Database,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import { Card, EmptyState, PageHeader, SensitivityBadge, Skeleton, StatCard } from '../components/ui';

export const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ title: string; text: string } | null>(null);

  // New policy form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<PolicyType>('ROLE_ELIGIBILITY');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadData = async () => {
    try {
      const [pols, ids, rls] = await Promise.all([
        fetchPolicies(),
        fetchIdentities(),
        fetchRoles(),
      ]);
      setPolicies(pols);
      setIdentities(ids);
      setRoles(rls);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute violation counts per policy across the entire fleet
  const violationsByPolicy = useMemo(() => {
    const counts: Record<string, number> = {};
    identities.forEach((id) => {
      id.policy.violations.forEach((v) => {
        counts[v.policyId] = (counts[v.policyId] || 0) + 1;
      });
    });
    return counts;
  }, [identities]);

  const filtered = useMemo(() => {
    return policies
      .filter((p) => selectedType === 'ALL' || p.type === selectedType)
      .filter(
        (p) =>
          !query.trim() ||
          `${p.name} ${p.description} ${p.type}`.toLowerCase().includes(query.trim().toLowerCase())
      );
  }, [policies, selectedType, query]);

  async function handleToggle(policy: Policy) {
    const nextState = policy.enabled === false ? true : false;
    setToggling((s) => ({ ...s, [policy.id]: true }));
    try {
      await updatePolicy(policy.id, { enabled: nextState });
      await loadData();
      setToast({
        title: `${policy.name} ${nextState ? 'Enabled' : 'Disabled'}`,
        text: `The orchestrator has recalculated policy posture across all identities.`,
      });
    } catch {
      setToast({ title: 'Error', text: 'Failed to update policy status.' });
    } finally {
      setToggling((s) => ({ ...s, [policy.id]: false }));
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deletePolicy(id);
      await loadData();
      setToast({ title: 'Policy Deleted', text: `Removed "${name}" from security controls.` });
    } catch {
      setToast({ title: 'Error', text: 'Failed to delete policy.' });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createPolicy({
        name: newName.trim(),
        type: newType,
        description: newDesc.trim(),
        enabled: true,
        config: {},
      });
      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
      await loadData();
      setToast({ title: 'Policy Created', text: `Added new ${newType} policy successfully.` });
    } catch {
      setToast({ title: 'Error', text: 'Failed to create policy.' });
    } finally {
      setCreating(false);
    }
  }

  const activeCount = policies.filter((p) => p.enabled !== false).length;
  const totalViolations = Object.values(violationsByPolicy).reduce((a, b) => a + b, 0);
  const agentPolicies = policies.filter((p) => p.type === 'AI_AGENT_GOVERNANCE').length;

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
      <div className="animate-rise">
        <PageHeader
          eyebrow="Workspace / Governance"
          title="Security Policies"
          description="Continuous declarative policies enforcing Least Privilege, Segregation of Duties (SoD), Role Eligibility, and AI Agent Governance."
          icon={<Shield className="h-5 w-5" />}
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => loadData()}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3.5 text-[12px] text-white/70 transition hover:border-white/20 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#b7ff49] px-4 text-[12px] font-semibold text-black transition hover:bg-[#a6ec3d]"
              >
                <Plus className="h-3.5 w-3.5" /> Define Policy
              </button>
            </div>
          }
        />

        {toast && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#b7ff49]/30 bg-[#b7ff49]/10 p-3.5 text-[13px] text-[#b7ff49]">
            <div>
              <strong>{toast.title}:</strong> {toast.text}
            </div>
            <button onClick={() => setToast(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
          <StatCard
            label="Active Policies"
            value={loading ? '–' : `${activeCount} / ${policies.length}`}
            detail="Enforced across all identities"
            icon={<ShieldCheck />}
            tone="lime"
          />
          <StatCard
            label="Violations Flagged"
            value={loading ? '–' : totalViolations}
            detail="Active breaches across fleet"
            icon={<ShieldAlert />}
            tone={totalViolations > 0 ? 'danger' : 'default'}
          />
          <StatCard
            label="AI Agent Guardrails"
            value={loading ? '–' : agentPolicies}
            detail="Autonomous identity policies"
            icon={<Bot />}
          />
          <StatCard
            label="Catalog Coverage"
            value={loading ? '–' : `${roles.length} Roles`}
            detail="Audited by PolicyAgent"
            icon={<Layers />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policies or description..."
              className="h-10 w-full rounded-full border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-[#b7ff49]/40"
            />
          </div>

          <div
            role="radiogroup"
            aria-label="Policy Type"
            className="scroll-quiet flex h-10 items-center overflow-x-auto rounded-full border border-white/[0.1] bg-white/[0.02] p-1 text-[12px]"
          >
            {[
              'ALL',
              'ROLE_ELIGIBILITY',
              'SOD',
              'AI_AGENT_GOVERNANCE',
              'LEAST_PRIVILEGE',
              'TOXIC_COMBINATION',
            ].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-medium transition ${
                  selectedType === t ? 'bg-white/[0.1] text-white' : 'text-white/55 hover:text-white'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Policy Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Shield className="h-4 w-4" />}
              title="No policies match"
              text="Try adjusting your filter or define a new policy."
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((policy) => {
              const count = violationsByPolicy[policy.id] || 0;
              const isEnabled = policy.enabled !== false;
              const isToggling = toggling[policy.id];

              return (
                <div
                  key={policy.id}
                  className={`flex flex-col rounded-2xl border p-5 transition ${
                    isEnabled
                      ? 'border-white/[0.09] bg-[#0d0e12] hover:border-white/[0.16]'
                      : 'border-white/[0.04] bg-[#090a0d] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {policy.type.replace(/_/g, ' ')}
                        </span>
                        {count > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                            <AlertTriangle className="h-2.5 w-2.5" /> {count} violation{count === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Clean
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-[15px] font-semibold text-white">{policy.name}</h3>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggle(policy)}
                      disabled={isToggling}
                      title={isEnabled ? 'Disable policy' : 'Enable policy'}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-[#b7ff49]' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/60">{policy.description}</p>

                  {/* Config Rule Highlights */}
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-[11px] text-white/70">
                    <strong className="block text-[10px] uppercase tracking-wider text-white/40">Rule Specifications:</strong>
                    {policy.type === 'SOD' && Array.isArray(policy.config.conflictingRoles) && (
                      <div className="mt-1 space-y-1">
                        {(policy.config.conflictingRoles as string[][]).map((pair, idx) => (
                          <div key={idx} className="font-mono text-[11px] text-white/80">
                            Conflicting pair: <span className="text-amber-300">{pair[0]}</span> ⟷{' '}
                            <span className="text-amber-300">{pair[1]}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {policy.type === 'ROLE_ELIGIBILITY' && Array.isArray(policy.config.rules) && (
                      <div className="mt-1 space-y-1">
                        {(policy.config.rules as any[]).map((r, idx) => (
                          <div key={idx} className="font-mono text-[11px] text-white/80">
                            {r.roleId}: min {r.minSeniority || 'ANY'} · allowed: [
                            {r.allowedEmploymentTypes?.join(', ') || 'ALL'}]
                          </div>
                        ))}
                      </div>
                    )}

                    {policy.type === 'AI_AGENT_GOVERNANCE' && (
                      <div className="mt-1 space-y-1">
                        <div>Accountable owner required: <span className="text-[#b7ff49]">TRUE</span></div>
                        <div>Restricts unvetted CRITICAL blast-radius roles: <span className="text-[#b7ff49]">TRUE</span></div>
                      </div>
                    )}

                    {policy.type === 'LEAST_PRIVILEGE' && (
                      <div className="mt-1">
                        Statistical domain spread benchmark compared to peer baseline ($\ge$1.8x deviation).
                      </div>
                    )}

                    {policy.type === 'TOXIC_COMBINATION' && Array.isArray(policy.config.toxicDomains) && (
                      <div className="mt-1 space-y-1">
                        {(policy.config.toxicDomains as string[][]).map((pair, idx) => (
                          <div key={idx} className="font-mono text-[11px]">
                            {pair[0]} ⚔️ {pair[1]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] mt-4">
                    <span className="text-white/40">ID: {policy.id}</span>
                    <button
                      onClick={() => handleDelete(policy.id, policy.name)}
                      className="flex items-center gap-1 text-red-400/70 transition hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Define Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0e12] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-[15px] font-semibold text-white">Define Security Policy</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                  Policy Name
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Cloud Admin Dual Custody Rule"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-white outline-none focus:border-[#b7ff49]/50"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                  Policy Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as PolicyType)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-white outline-none focus:border-[#b7ff49]/50"
                >
                  <option value="ROLE_ELIGIBILITY" className="bg-[#121317]">ROLE_ELIGIBILITY</option>
                  <option value="SOD" className="bg-[#121317]">SOD (Segregation of Duties)</option>
                  <option value="AI_AGENT_GOVERNANCE" className="bg-[#121317]">AI_AGENT_GOVERNANCE</option>
                  <option value="LEAST_PRIVILEGE" className="bg-[#121317]">LEAST_PRIVILEGE</option>
                  <option value="TOXIC_COMBINATION" className="bg-[#121317]">TOXIC_COMBINATION</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain why this constraint is enforced and the compliance exposure it prevents..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-white outline-none focus:border-[#b7ff49]/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-[12px] text-white/70 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-[#b7ff49] px-4 py-2 text-[12px] font-semibold text-black hover:bg-[#a6ec3d] disabled:opacity-50"
                >
                  {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
