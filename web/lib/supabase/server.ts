import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/* Server-side Supabase client. Sessions live in httpOnly cookies rather than
   localStorage, so the access token is no longer reachable from page scripts. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component, where cookies are read-only
          }
        },
      },
    }
  );
}

/* A client with no session at all, for data that is public anyway.

   The catalogue and the site's own wording are readable by everyone - both
   tables say so in their policies - so fetching them does not need the caller's
   cookies. Without cookies the result is the same for every visitor, which is
   what lets it be cached between requests rather than fetched again for each
   one; a function that reads cookies cannot be. */
export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
