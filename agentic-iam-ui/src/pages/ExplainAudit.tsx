import React, { useEffect, useState } from 'react';
import { fetchIdentities, IdentityViewModel } from '../services/iamApi';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { RemediationActions } from '../components/RemediationActions';

export const ExplainAudit: React.FC = () => {
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchIdentities().then((ids) => {
      setIdentities(ids);
      if (!selectedId && ids.length > 0) {
        setSelectedId(ids[0].identity.id);
      }
    });
  }, []);

  const selected = identities.find((vm) => vm.identity.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
      <h1 className="text-xl font-bold text-slate-100 mb-2">Explainability & Audit</h1>
      {/* Optionally add a selector for identities */}
      <ExplainabilityPanel viewModel={selected} />
      <RemediationActions viewModel={selected} onActionCompleted={() => fetchIdentities().then(setIdentities)} />
    </div>
  );
};
