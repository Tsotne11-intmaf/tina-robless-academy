import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* Runs before every matched request. Two jobs: keep the Supabase session cookie
   fresh so a student is not silently logged out mid-lesson, and refuse the student
   area outright to anyone not signed in.

   Named proxy rather than middleware because Next 16 deprecated that convention.
   The rename is not cosmetic here: this file is what carries a refreshed token
   forward to the page that renders next, and the pages send anyone they cannot
   identify to the login screen. Staying on a deprecated path for the one piece of
   the request chain that hands cookies onward is not where to take that chance.

   This is the part the single-file version could not do. There, the ownership check
   ran in the browser after the whole page - lesson content included - had already
   been delivered. Here the request never reaches the page. */

const PROTECTED = ["/dashboard", "/course", "/lesson", "/hw", "/mycert", "/profile", "/admin"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() revalidates against Supabase rather than trusting the cookie's claims.
  let { data: { user }, error } = await supabase.auth.getUser();

  /* Failing to ask is not the same as being turned down.

     getUser() is a network call to Supabase on every single request, and the answer
     used to be read as a plain yes/no: anything other than a user meant "signed out"
     and the visitor was sent to the login page. A timed-out or 5xx reply therefore
     looked identical to an expired session, so a student with perfectly valid
     cookies could be thrown out mid-lesson by one bad round trip. Supabase's own
     logs show no token being rejected, which is what pointed here.

     A definite refusal - Supabase answering 4xx - still ends the session. Only the
     inconclusive cases are retried. */
  if (!user && isInconclusive(error)) {
    ({ data: { user }, error } = await supabase.auth.getUser());
  }

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    const redirect = NextResponse.redirect(url);
    /* Carry over anything the refresh above wrote. A bare redirect discards those
       Set-Cookie headers, which can leave the browser holding a refresh token that
       has already been rotated away - the next request then really would fail. */
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

/* Network trouble rather than a rejected token: supabase-js reports an unreachable
   endpoint with no status at all, and anything from 429 or 500 upwards is the
   service asking to be tried again rather than saying no. */
function isInconclusive(error: unknown): boolean {
  if (!error) return false;
  const status = (error as { status?: number }).status;
  return status === undefined || status === 0 || status === 429 || status >= 500;
}

export const config = {
  // Skip static assets and images so the auth check does not run on every file.
  matcher: ["/((?!_next/static|_next/image|img/|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
