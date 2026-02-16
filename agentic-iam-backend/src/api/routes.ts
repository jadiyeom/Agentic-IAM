import { seedRoles, seedEntitlements, seedIdentities } from '../seed';
import express from 'express';
import { IAMOrchestrator } from '../orchestrator/IAMController';

export function createRouter(orchestrator: IAMOrchestrator) {
  const router = express.Router();
  // Delete an identity
  router.delete('/identities/:id', async (req, res) => {
    const id = req.params.id;
    console.log('DELETE /identities/:id called. Params:', req.params);
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
    console.log('POST /identities called. Body:', req.body);
    try {
      const identity = await orchestrator.createIdentity(req.body);
      res.status(201).json(identity);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create identity' });
    }
  });

  // Assign a role to an identity
  router.post('/identities/:id/roles', async (req, res) => {
    console.log('POST /identities/:id/roles called. Params:', req.params, 'Body:', req.body);
    const { roleId } = req.body;
    if (!roleId) {
      res.status(400).json({ error: 'roleId is required' });
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

