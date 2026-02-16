import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRouter } from './api/routes';
import { IAMOrchestrator } from './orchestrator/IAMController';
import { seedEntitlements, seedIdentities, seedPolicies, seedRoles } from './seed';

// In-memory request log
const requestLog: Array<{ method: string; url: string; timestamp: string; body?: any; query?: any; params?: any; data?: any }> = [];

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  requestLog.push({
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
    body: req.body,
    query: req.query,
    params: req.params,
    data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : null,
  });
  // Keep log size reasonable (last 200 requests)
  if (requestLog.length > 200) requestLog.shift();
  next();
});

const orchestrator = new IAMOrchestrator();

app.use('/api', createRouter(orchestrator));

// Expose request log endpoint
app.get('/api/request-log', (_req, res) => {
  res.json(requestLog);
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Agentic IAM backend listening on port ${port}`);
});

