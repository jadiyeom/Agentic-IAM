import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRouter } from './api/routes';
import { IAMOrchestrator } from './orchestrator/IAMController';
import { seedEntitlements, seedIdentities, seedPolicies, seedRoles } from './seed';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new IAMOrchestrator();

app.use('/api', createRouter(orchestrator));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Agentic IAM backend listening on port ${port}`);
});

