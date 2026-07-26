import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://zfjehsrnsszxbtqvgbwq.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_sA3doXQCeX371tO-cOuYDQ_XvgupIbM";

/**
 * New-format `sb_publishable_*` keys are opaque, not JWTs. When there is no user
 * session, supabase-js still sends `Authorization: Bearer <key>`, which some
 * PostgREST versions reject. Strip it in that case; keep it when it carries a
 * real user JWT (so RLS still applies as the signed-in user).
 */
const patchedFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "hibalag-auth",
  },
  global: { fetch: patchedFetch },
});
