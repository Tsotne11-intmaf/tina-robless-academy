import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* POST, not GET, and that is the point.

   Mail clients and security scanners follow links in messages before a person
   ever sees them. An unsubscribe that happened on GET would silently switch
   people off simply because their provider previewed the email. The link opens
   a page with a button; only pressing it reaches here.

   The token is the only credential, because whoever clicks is not signed in, and
   the database function behind it can do exactly one thing: set marketing_ok to
   false for the row holding that token. */
export async function POST(request: Request) {
  let token = "";
  try {
    token = String(((await request.json()) as { token?: unknown }).token ?? "");
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ error: "bad token" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("unsubscribe", { token });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Same answer either way: a wrong token must not reveal whether it exists.
  return NextResponse.json({ ok: true, changed: data === true });
}
