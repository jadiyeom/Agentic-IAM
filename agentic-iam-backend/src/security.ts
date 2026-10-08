import express from 'express';
import cors from 'cors';

/**
 * Shared hardening for both the local server and the Vercel function.
 * Small and dependency-free on purpose.
 */
export function applySecurity(app: express.Express) {
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '32kb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Fixed-window rate limit for writes, so the public demo can't be hammered.
  const WINDOW_MS = 60_000;
  const MAX_WRITES = Number(process.env.WRITE_RATE_LIMIT || 60);
  const hits = new Map<string, { count: number; start: number }>();
  app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') return next();
    const key = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() || req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now - entry.start > WINDOW_MS) {
      hits.set(key, { count: 1, start: now });
      if (hits.size > 5000) hits.clear();
      return next();
    }
    entry.count += 1;
    if (entry.count > MAX_WRITES) {
      res.setHeader('Retry-After', String(Math.ceil((entry.start + WINDOW_MS - now) / 1000)));
      res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
      return;
    }
    next();
  });
}

/** JSON error handler, including malformed JSON bodies. */
export function errorHandler(err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Malformed JSON body' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal error' });
}
