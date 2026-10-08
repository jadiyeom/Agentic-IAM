import express from 'express';
import { createRouter } from './api/routes';
import { IAMOrchestrator } from './orchestrator/IAMController';
import { applySecurity, errorHandler } from './security';

// Express app for Vercel serverless (no app.listen). State is in-memory per instance.
const app = express();
applySecurity(app);

const orchestrator = new IAMOrchestrator();
app.use('/api', createRouter(orchestrator));
app.use(errorHandler);

export default app;
