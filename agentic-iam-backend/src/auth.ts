import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

let client: SupabaseClient | null = null;
function getAuthClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** Fail closed: every API caller must present a valid Supabase access token. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') { next(); return; }
  const authClient = getAuthClient();
  if (!authClient) {
    res.status(503).json({ error: 'Authentication is not configured on this deployment.' });
    return;
  }
  const header = req.header('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  try {
    const { data, error } = await authClient.auth.getUser(match[1]);
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired access token.' });
      return;
    }
    res.locals.authUser = { id: data.user.id, email: data.user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Could not validate access token.' });
  }
}
