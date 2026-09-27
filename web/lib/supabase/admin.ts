import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/* A client with no user behind it, for the scheduled job only.

   The nightly reminder has to look across every student's profile, and there is
   no session to authorise that - it runs from Vercel's scheduler, not from a
   browser. The service role key bypasses Row Level Security entirely, which is
   exactly why it must never reach the client bundle: no NEXT_PUBLIC_ prefix, and
   this file is imported only from route handlers that run on the server.

   Anything a signed-in person triggers uses their own session instead, so RLS
   still decides. This is reserved for work nobody is logged in for. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
