import { seedRoles, seedEntitlements, seedIdentities } from '../seed';
import express from 'express';
import { IAMOrchestrator } from '../orchestrator/IAMController';

const SENIORITY = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE'];
const EMPLOYMENT = ['FULL_TIME', 'CONTRACTOR', 'INTERN', 'AUTOMATION'];
const IDENTITY_TYPES = ['HUMAN', 'SERVICE', 'AI_AGENT'];

function validateNewIdentity(body: any): string | null {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';
  if (typeof body.name !== 'string' || !body.name.trim()) return 'name is required';
  const a = body.attributes;
  if (!a || typeof a !== 'object') return 'attributes are required';
  for (const f of ['department', 'title', 'location']) {
    if (typeof a[f] !== 'string' || !a[f].trim()) return `attributes.${f} is required`;
  }
  if (!SENIORITY.includes(a.seniority)) return `attributes.seniority must be one of ${SENIORITY.join(', ')}`;
  if (!EMPLOYMENT.includes(a.employmentType)) return `attributes.employmentType must be one of ${EMPLOYMENT.join(', ')}`;
  if (a.identityType !== undefined && !IDENTITY_TYPES.includes(a.identityType)) return `attributes.identityType must be one of ${IDENTITY_TYPES.join(', ')}`;
  return null;
}

export function createRouter(orchestrator: IAMOrchestrator) {
  const router = express.Router();
  // Delete an identity
  router.delete('/identities/:id', async (req, res) => {
    const id = req.params.id;
    const deleted = orchestrator.removeIdentity(id);
    if (!deleted) {
      res.status(404).json({ error: 'Identity not found' });
      return;
    }
    res.status(204).send();
  });
  // In-memory roles (simulate DB)
  const roles = seedRoles();
  router.get('/roles', (req, res) => {
    res.json(roles);
  });

  // Add new identity
  router.post('/identities', async (req, res) => {
    const problem = validateNewIdentity(req.body);
    if (problem) {
      res.status(400).json({ error: problem });
      return;
    }
    try {
      const b = req.body;
      const identity = await orchestrator.createIdentity({
        name: String(b.name).trim().slice(0, 80),
        attributes: {
          department: String(b.attributes.department).trim().slice(0, 60),
          title: String(b.attributes.title).trim().slice(0, 80),
          seniority: b.attributes.seniority,
          employmentType: b.attributes.employmentType,
          location: String(b.attributes.location).trim().slice(0, 60),
          identityType: b.attributes.identityType,
          owner: b.attributes.owner ? String(b.attributes.owner).slice(0, 80) : undefined,
        },
        roles: [],
        entitlements: [],
      });
      res.status(201).json(identity);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create identity' });
    }
  });

  // Assign a role to an identity
  router.post('/identities/:id/roles', async (req, res) => {
    const { roleId } = req.body ?? {};
    if (!roleId || typeof roleId !== 'string' || !roles.some((r) => r.id === roleId)) {
      res.status(400).json({ error: 'A valid roleId is required' });
      return;
    }
    try {
      const updated = orchestrator.assignRoleToIdentity(req.params.id, roleId);
      if (!updated) {
        res.status(404).json({ error: 'Identity not found' });
        return;
      }
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  });


  // Audit timeline endpoint
  router.get('/audit/timeline', async (_req, res) => {
    try {
      const timeline = await orchestrator.getAuditTimeline();
      res.json(timeline);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch audit timeline' });
    }
  });

  // Risk distribution endpoint
  router.get('/metrics/risk-distribution', async (_req, res) => {
    try {
      const dist = await orchestrator.getRiskDistribution();
      res.json(dist);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch risk distribution' });
    }
  });

  // Decision volume endpoint
  router.get('/metrics/decision-volume', async (_req, res) => {
    try {
      const volume = await orchestrator.getDecisionVolume();
      res.json(volume);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch decision volume' });
    }
  });

  // Agent health endpoint
  router.get('/agent-status', async (_req, res) => {
    try {
      const status = await orchestrator.getAgentHealth();
      res.json(status);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch agent status' });
    }
  });

  // Identity access history, manager, risk trend
  router.get('/identities/:id/context', async (req, res) => {
    try {
      const context = await orchestrator.getIdentityContext(req.params.id);
      if (!context) {
        res.status(404).json({ error: 'Identity not found' });
        return;
      }
      res.json(context);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch identity context' });
    }
  });

  // List all identities with risk, policy, decision, anomaly.
  router.get('/identities', async (_req, res) => {
    try {
      const results = await orchestrator.evaluateAllIdentities();
      res.json(results);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: 'Failed to evaluate identities' });
    }
  });

  // Single identity detail.
  router.get('/identities/:id', async (req, res) => {
    try {
      const result = await orchestrator.evaluateIdentity(req.params.id);
      if (!result) {
        res.status(404).json({ error: 'Identity not found' });
        return;
      }
      res.json(result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: 'Failed to evaluate identity' });
    }
  });

  // Simulation: assign abnormal role to identity (e.g., intern gets prod DB admin).
  router.post('/simulate/anomaly', async (req, res) => {
    const { identityId, roleId } = req.body as { identityId: string; roleId: string };
    if (!identityId || !roleId) {
      res.status(400).json({ error: 'identityId and roleId are required' });
      return;
    }
    try {
      const result = await orchestrator.simulateAbnormalRole(identityId, roleId);
      if (!result) {
        res.status(404).json({ error: 'Identity not found' });
        return;
      }
      res.json(result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: 'Failed to simulate anomaly' });
    }
  });

  // Remediation controls.
  router.post('/identities/:id/actions', async (req, res) => {
    const { action, decisionOutcome, reason } = req.body as {
      action: 'REVOKE_ACCESS' | 'SEND_FOR_REVIEW' | 'IGNORE';
      decisionOutcome: string;
      reason?: string;
    };

    const id = req.params.id;

    try {
      if (action === 'REVOKE_ACCESS' || action === 'SEND_FOR_REVIEW') {
        const mappedOutcome =
          action === 'REVOKE_ACCESS' ? 'AUTO_REMEDIATE' : ('FLAG_FOR_REVIEW' as const);
        const result = orchestrator.autoRemediate(id, mappedOutcome);
        if (!result) {
          res.status(404).json({ error: 'Identity not found or no remediation applied' });
          return;
        }
        res.json(result);
      } else if (action === 'IGNORE') {
        if (!reason) {
          res.status(400).json({ error: 'reason is required when ignoring a decision' });
          return;
        }
        const rem = orchestrator.overrideDecision(id, decisionOutcome as any, reason);
        res.json(rem);
      } else {
        res.status(400).json({ error: 'Unsupported action' });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: 'Failed to apply remediation' });
    }
  });

  // Liveness + configuration (never exposes secrets).
  router.get('/health', async (_req, res) => {
    res.json({ ok: true, ...(await orchestrator.getAgentHealth()) });
  });

  // Restore the seeded demo dataset.
  router.post('/reset', (_req, res) => {
    orchestrator.reset();
    res.json({ ok: true });
  });

  // Metrics & audit.
  router.get('/metrics', (_req, res) => {
    res.json(orchestrator.getMetrics());
  });

  router.get('/audit', (_req, res) => {
    res.json(orchestrator.getAuditLog());
  });

  router.get('/remediation-log', (_req, res) => {
    res.json(orchestrator.getRemediationLog());
  });

  // Entitlements endpoint (actually roles)
  router.get('/entitlements', (_req, res) => {
    res.json(roles);
  });

  // Departments endpoint
  const identities = seedIdentities();
  const deptCounts: Record<string, number> = {};
  identities.forEach(i => {
    const dept = i.attributes.department;
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const departments = Array.from(new Set(identities.map(i => i.attributes.department)));
  router.get('/departments', (_req, res) => {
    res.json(departments.map(name => ({ id: name, name, count: deptCounts[name] })));
  });

  return router;
}

