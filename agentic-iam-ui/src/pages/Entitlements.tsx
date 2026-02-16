import React, { useEffect, useState } from 'react';
import { getEntitlements } from '../services/iamApi';

interface Entitlement {
  id: string;
  name: string;
  description: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  domains: string[];
}

const Entitlements: React.FC = () => {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  useEffect(() => {
    getEntitlements().then(setEntitlements);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-surfaceAlt/60 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">Entitlements (Roles)</h2>
          <p className="text-xs text-slate-400">
            {entitlements.length} entitlements in the system.
          </p>
        </div>
      </div>
      <div className="max-h-[460px] overflow-y-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-surfaceAlt">
            <tr className="text-xs uppercase text-slate-400">
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Sensitivity</th>
              <th className="px-4 py-2 font-medium">Domains</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {entitlements.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-6 text-center text-slate-500">No entitlements found.</td>
              </tr>
            ) : (
              entitlements.map((ent) => (
                <tr key={ent.id} className="hover:bg-slate-800/60 transition">
                  <td className="whitespace-nowrap px-4 py-2 align-top text-slate-50 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/60 bg-accent/10 text-accent text-xs font-semibold">
                        {ent.name.split(' ').map(x => x[0]).join('').toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-slate-50">{ent.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-slate-200">{ent.description}</td>
                  <td className="px-4 py-2 align-top text-xs text-slate-200">{ent.sensitivity}</td>
                  <td className="px-4 py-2 align-top text-xs text-slate-200">{ent.domains.join(', ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Entitlements;
