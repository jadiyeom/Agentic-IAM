# Authentication setup

This branch adds Supabase Auth for email/password sign-in and server-side API token validation.

## Required environment variables

Configure these in the Vercel project (Production and Preview as needed):

- `VITE_SUPABASE_URL`: Supabase project URL, exposed to the browser by design.
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key, exposed to the browser by design.
- `SUPABASE_URL`: the same project URL, for the backend.
- `SUPABASE_ANON_KEY`: the same publishable/anon key, for the backend token-validation client.

Never use a Supabase service-role key in browser variables. This implementation does not need one.

## Supabase console

1. Create a Supabase project.
2. In Authentication → Providers, enable Email.
3. In Authentication → URL Configuration, add `https://steerpast.com` and your Vercel preview URL(s) to the allowed redirect URLs.
4. Add the four environment variables above in Vercel and redeploy.

## Behavior

- Workspace APIs, including connector registry/sync endpoints, require a valid Supabase access token.
- The browser attaches the current access token to API requests.
- Sign-out clears the Supabase session.
- If backend auth environment variables are missing, API routes fail closed with HTTP 503; they do not become public.
- This is authentication, not yet workspace/tenant isolation. Data remains in-memory and must not be treated as tenant-separated. Implement per-user/workspace authorization and durable storage before allowing customer data or live provider credentials.
- The public marketing pages remain accessible. Entering the workspace and synthetic demo now requires a signed-in account.
