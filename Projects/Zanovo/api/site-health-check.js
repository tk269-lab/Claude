// Vercel Cron endpoint — pings every site in the Zanovo dashboard's `sites`
// table and records the result to `site_health`. Runs server-side, independent
// of whether the dashboard app is open, since that's the only way to get
// reliable 24/7 uptime data (see Zanovo Dashboard CLAUDE.md, Phase 2).
//
// Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
// when CRON_SECRET is set as an env var on this project. Reject anything else
// so this endpoint can't be used to spam-write arbitrary rows.
//
// Uses the Supabase service role key (bypasses RLS) because a cron job has no
// logged-in user/session — owner_id must be set explicitly per site since the
// column default (`auth.uid()`) resolves to null under the service role.

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'nodejs' };

const CHECK_TIMEOUT_MS = 10_000;

export default async function handler(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Missing Supabase server env vars', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('id, owner_id, name, url');

  if (sitesError) {
    return Response.json({ error: sitesError.message }, { status: 500 });
  }

  const results = await Promise.all((sites ?? []).map((site) => checkAndRecord(supabase, site)));

  return Response.json({ checked: results.length, results });
}

async function checkAndRecord(supabase, site) {
  const started = Date.now();
  let isUp = false;
  let statusCode = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const response = await fetch(site.url, { method: 'GET', signal: controller.signal });
    clearTimeout(timeout);
    statusCode = response.status;
    isUp = response.ok;
  } catch {
    isUp = false;
  }

  const latencyMs = Date.now() - started;

  // Look at the previous check to detect a state transition (for future push
  // alerting — debounce logic per the original plan: only notify on
  // up->down or down->up, never on every single "still down" check).
  const { data: previous } = await supabase
    .from('site_health')
    .select('is_up')
    .eq('site_id', site.id)
    .order('checked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let transition = null;
  if (previous && previous.is_up !== isUp) {
    transition = isUp ? 'recovered' : 'went_down';
  }

  await supabase.from('site_health').insert({
    site_id: site.id,
    owner_id: site.owner_id,
    is_up: isUp,
    latency_ms: latencyMs,
    status_code: statusCode,
  });

  // TODO(phase 2 follow-up): fire an Expo push notification here when
  // transition is set, using the device_tokens table. Deferred — needs the
  // Expo Push API wired up, which is a separate, larger piece of work.

  return { site: site.name, is_up: isUp, latency_ms: latencyMs, transition };
}
