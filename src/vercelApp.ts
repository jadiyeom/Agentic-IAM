import express from 'express';
import cors from 'cors';
import { createRouter } from './api/routes';
import { IAMOrchestrator } from './orchestrator/IAMController';

// Express app for Vercel serverless (no app.listen). State is in-memory per instance.
const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new IAMOrchestrator();
app.use('/api', createRouter(orchestrator));

export default app;
