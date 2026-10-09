import express from 'express';
import dotenv from 'dotenv';
import { createRouter } from './api/routes';
import { createConnectorRouter } from './connectors';
import { createSyncRouter } from './connectorSync';
import { IAMOrchestrator } from './orchestrator/IAMController';
import { applySecurity, errorHandler } from './security';
import { requireAuth } from './auth';

dotenv.config();

const app = express();
applySecurity(app);

const orchestrator = new IAMOrchestrator();

// Protect every API route, including connector registry and sync endpoints.
app.use('/api', requireAuth);
app.use('/api/connectors', createConnectorRouter());
app.use('/api/connectors', createSyncRouter());
app.use('/api', createRouter(orchestrator));
app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Steerpast IAM backend listening on port ${port}`);
});
