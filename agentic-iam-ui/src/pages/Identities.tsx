import React, { useEffect, useState } from 'react';
import { fetchIdentities, IdentityViewModel, createIdentity, fetchRoles, Role } from '../services/iamApi';
import { IdentityTable } from '../components/IdentityTable';
import { RiskLegend } from '../components/RiskLegend';

export const Identities: React.FC = () => {
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newIdentity, setNewIdentity] = useState({
    name: '',
    department: '',
    title: '',
    seniority: 'INTERN',
    employmentType: 'INTERN',
    location: '',
    roles: [],
    entitlements: [],
  });

  useEffect(() => {
    fetchIdentities().then((ids) => {
      setIdentities(ids);
      if (!selectedId && ids.length > 0) {
        setSelectedId(ids[0].identity.id);
      }
    });
    fetchRoles().then(setRoles);
  }, []);

  const selected = identities.find((vm) => vm.identity.id === selectedId) ?? null;
  const departments = Array.from(new Set(identities.map(i => i.identity.attributes.department)));

  // Filtering logic
  const filtered = identities.filter(vm => {
    if (search && !vm.identity.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && vm.identity.attributes.department !== department) return false;
    if (riskLevel) {
      const score = vm.risk.riskScore;
      if (riskLevel === 'low' && !(score >= 0 && score <= 5)) return false;
      if (riskLevel === 'medium' && !(score >= 6 && score <= 12)) return false;
      if (riskLevel === 'high' && score < 13) return false;
    }
    if (highRiskOnly && vm.risk.riskScore < 13) return false;
    return true;
  });

  async function handleCreateIdentity(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await createIdentity({
        name: newIdentity.name,
        attributes: {
          department: newIdentity.department,
          title: newIdentity.title,
          seniority: newIdentity.seniority as any,
          employmentType: newIdentity.employmentType as any,
          location: newIdentity.location,
        },
        roles: [],
        entitlements: [],
      });
      setShowCreate(false);
      setNewIdentity({
        name: '',
        department: '',
        title: '',
        seniority: 'INTERN',
        employmentType: 'INTERN',
        location: '',
        roles: [],
        entitlements: [],
      });
      fetchIdentities().then((ids) => {
        setIdentities(ids);
        if (!selectedId && ids.length > 0) {
          setSelectedId(ids[0].identity.id);
        }
      });
    } catch (err) {
      setCreateError('Failed to create identity.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteIdentity(id: string) {
    // Refresh identities after delete
    const ids = await fetchIdentities();
    setIdentities(ids);
    if (ids.length > 0) {
      setSelectedId(ids[0].identity.id);
    } else {
      setSelectedId(undefined);
    }
  }

  async function handleRoleAssigned() {
    // Refresh identities after role assignment
    const ids = await fetchIdentities();
    setIdentities(ids);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
      <h1 className="text-xl font-bold text-slate-100 mb-2">Identities</h1>
      <button
        className="mb-2 w-fit rounded bg-accent px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-accentSoft"
        onClick={() => setShowCreate(true)}
      >
        + Create Identity
      </button>
      {/* Create Identity Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl min-w-[320px]"
            onSubmit={handleCreateIdentity}
          >
            <h2 className="text-lg font-bold text-slate-100 mb-2">Create New Identity</h2>
            <input
              className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-slate-100"
              placeholder="Name"
              value={newIdentity.name}
              onChange={e => setNewIdentity({ ...newIdentity, name: e.target.value })}
              required
            />
            <input
              className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-slate-100"
              placeholder="Department"
              value={newIdentity.department}
              onChange={e => setNewIdentity({ ...newIdentity, department: e.target.value })}
              required
            />
            <input
              className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-slate-100"
              placeholder="Title"
              value={newIdentity.title}
              onChange={e => setNewIdentity({ ...newIdentity, title: e.target.value })}
              required
            />
            <select
              className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-slate-100"
              value={newIdentity.seniority}
              onChange={e => setNewIdentity({ ...newIdentity, seniority: e.target.value })}
              required
            >
              <option value="INTERN">Intern</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid</option>
              <option value="SENIOR">Senior</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
            <select
              className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-slate-100"
              value={newIdentity.employmentType}
              onChange={e => setNewIdentity({ ...newIdentity, employmentType: e.target.value })}
              required
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="CONTRACTOR">Contractor</option>
              <option value="INTERN">Intern</option>
            </select>
            <input
              className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-slate-100"
              placeholder="Location"
              value={newIdentity.location}
              onChange={e => setNewIdentity({ ...newIdentity, location: e.target.value })}
              required
            />
            {createError && <div className="text-danger text-xs">{createError}</div>}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="rounded bg-accent px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-accentSoft disabled:opacity-60"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                className="rounded border border-slate-700 bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-100 hover:bg-slate-700"
                onClick={() => setShowCreate(false)}
                disabled={creating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Filter/Search Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <input
          type="text"
          placeholder="Search identities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded px-3 py-1 bg-slate-800 text-slate-100 border border-slate-700 focus:outline-accent"
        />
        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          className="rounded px-3 py-1 bg-slate-800 text-slate-100 border border-slate-700"
        >
          <option value="">Department</option>
          {departments.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        <select
          value={riskLevel}
          onChange={e => setRiskLevel(e.target.value)}
          className="rounded px-3 py-1 bg-slate-800 text-slate-100 border border-slate-700"
        >
          <option value="">Risk Level</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={highRiskOnly}
            onChange={e => setHighRiskOnly(e.target.checked)}
            className="accent-danger"
          />
          Show High Risk Only
        </label>
        <RiskLegend className="ml-auto" />
      </div>
      <IdentityTable
        identities={filtered}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDeleteIdentity}
        roles={roles}
        onRoleAssigned={handleRoleAssigned}
      />
      {/* DecisionFlow and RemediationActions moved to other pages */}
    </div>
  );
};
