import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* Runs before every matched request. Two jobs: keep the Supabase session cookie
   fresh so a student is not silently logged out mid-lesson, and refuse the student
   area outright to anyone not signed in.

   This is the part the single-file version could not do. There, the ownership check
   ran in the browser after the whole page - lesson content included - had already
   been delivered. Here the request never reaches the page. */

const PROTECTED = ["/dashboard", "/course", "/lesson", "/hw", "/mycert", "/profile", "/admin"];

export async function middleware(request: NextRequest) {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static assets and images so the auth check does not run on every file.
  matcher: ["/((?!_next/static|_next/image|img/|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
