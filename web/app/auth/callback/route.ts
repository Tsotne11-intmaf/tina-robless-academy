import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* The missing half of every email link.

   @supabase/ssr uses the PKCE flow, so a confirmation or recovery email does not
   carry a session - it carries a one-time ?code=. Something has to trade that code
   for a session cookie, and until this route existed nothing did: the link landed on
   a page that ignored the parameter, which is why clicking the recovery mail
   appeared to do nothing at all.

   The exchange has to happen on the server because the session is written to
   httpOnly cookies that page scripts cannot set. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  // Vercel terminates TLS at the edge, so request.url carries the internal host.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : url.origin;

  // Supabase reports a rejected or expired link in the query, not as an exception.
  const authError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (authError) return NextResponse.redirect(`${origin}/login?authError=1`);

  if (!code) return NextResponse.redirect(`${origin}/login?authError=1`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?authError=1`);

  return NextResponse.redirect(`${origin}${next}`);
}

/* Only same-site paths. Without this, ?next=https://example.com would turn the
   callback into an open redirect that borrows the site's credibility. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
