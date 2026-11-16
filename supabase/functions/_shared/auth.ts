import { createClient } from 'npm:@supabase/supabase-js@2';

export const authCors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...authCors, 'Content-Type': 'application/json' } });

export function serviceClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns { userId } or a 401 Response. Token from Authorization header or ?access_token= (for <img> tags). */
export async function requireUser(req: Request): Promise<{ userId: string } | Response> {
  let token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) token = new URL(req.url).searchParams.get('access_token') ?? '';
  if (!token) return json({ error: 'Unauthorized' }, 401);
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data, error } = await anon.auth.getClaims(token);
  const sub = data?.claims?.sub;
  // Reject the anon key itself (no sub / role anon)
  if (error || !sub || data?.claims?.role !== 'authenticated') return json({ error: 'Unauthorized' }, 401);
  return { userId: sub as string };
}

export async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const r = await requireUser(req);
  if (r instanceof Response) return r;
  const { data, error } = await serviceClient().rpc('has_role', { _user_id: r.userId, _role: 'admin' });
  if (error || data !== true) return json({ error: 'Forbidden' }, 403);
  return r;
}

/** Simple sliding-window limit. Returns a 429 Response when exceeded, else null (and records the hit). */
export async function rateLimit(action: string, subject: string, max: number, windowSec: number): Promise<Response | null> {
  const sb = serviceClient();
  const since = new Date(Date.now() - windowSec * 1000).toISOString();
  const { count } = await sb.from('rate_limit_events').select('id', { count: 'exact', head: true })
    .eq('action', action).eq('subject', subject).gte('created_at', since);
  if ((count ?? 0) >= max) return json({ error: 'Too many requests. Please try again later.' }, 429);
  await sb.from('rate_limit_events').insert({ action, subject });
  return null;
}
