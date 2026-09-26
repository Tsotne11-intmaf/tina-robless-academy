import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* Records the uploaded avatar against the signed-in student's profile.

   This cannot be done in UploadThing's onUploadComplete: that hook is a callback
   from UploadThing's own servers, so it carries none of the visitor's cookies and
   the Supabase client it built was anonymous. The update policy is auth.uid() = id,
   auth.uid() is null for anonymous, and an update matching no rows is not an error -
   so the write silently did nothing while the browser happily showed the picture it
   had just uploaded. It reappeared as missing on the next page load.

   Here the request comes from the student's own browser, so the session is present
   and RLS decides the outcome exactly as it does everywhere else. */

// Only files served by our own UploadThing app, so this cannot be used to point a
// profile picture at an arbitrary third-party URL.
const ALLOWED_HOST = /(^|\.)(ufs\.sh|utfs\.io)$/;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });
  }

  let url: string;
  try {
    url = String(((await request.json()) as { url?: unknown }).url ?? "");
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" || !ALLOWED_HOST.test(parsed.hostname)) {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: parsed.toString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, url: parsed.toString() });
}
