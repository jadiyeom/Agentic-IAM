import express from 'express';
import { createRouter } from './api/routes';
import { createConnectorRouter } from './connectors';
import { createSyncRouter } from './connectorSync';
import { IAMOrchestrator } from './orchestrator/IAMController';
import { applySecurity, errorHandler } from './security';

// Express app for Vercel serverless (no app.listen). State is in-memory per instance.
const app = express();
applySecurity(app);

const orchestrator = new IAMOrchestrator();

// Register connector endpoints in the serverless app as well as the local Express entrypoint.
app.use('/api/connectors', createConnectorRouter());
app.use('/api/connectors', createSyncRouter());
app.use('/api', createRouter(orchestrator));
app.use(errorHandler);

export default app;
