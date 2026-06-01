/**
 * Headers for calling Supabase Edge Functions from the browser.
 *
 * New publishable keys (sb_publishable_*) are not JWTs and must use the `apikey`
 * header. Legacy anon keys (eyJ*) use Authorization Bearer (and apikey for compatibility).
 */
export function getSupabaseFunctionHeaders(extra = {}) {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY");
  }

  const base = {
    "Content-Type": "application/json",
    apikey: key,
    ...extra,
  };

  if (!key.startsWith("sb_publishable_") && !key.startsWith("sb_secret_")) {
    base.Authorization = `Bearer ${key}`;
  }

  return base;
}
