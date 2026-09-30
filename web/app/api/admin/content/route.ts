import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

type Edit = { key: string; value: string };

/* Saves the wording the owner changed on the page itself.

   Only the keys that actually changed are sent, so a page with eighty editable
   spots writes one row when one sentence is reworded. An empty value deletes
   the row rather than storing "", which puts that spot back to the wording in
   the code - the only way to undo an edit without knowing what it used to say. */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return NextResponse.json({ error: "წვდომა აკრძალულია" }, { status: 403 });

  let edits: Edit[];
  try {
    const body = (await request.json()) as { edits?: unknown };
    edits = Array.isArray(body.edits) ? (body.edits as Edit[]) : [];
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const clean = edits
    .filter((e) => e && typeof e.key === "string" && typeof e.value === "string")
    .map((e) => ({ key: e.key.slice(0, 200), value: e.value.slice(0, 8000).trim() }));

  if (!clean.length) return NextResponse.json({ ok: true, saved: 0 });

  const remove = clean.filter((e) => e.value === "").map((e) => e.key);
  const upsert = clean.filter((e) => e.value !== "");

  if (remove.length) {
    const { error } = await supabase.from("content").delete().in("key", remove);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (upsert.length) {
    const { error } = await supabase.from("content").upsert(
      upsert.map((e) => ({
        key: e.key,
        value: e.value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })),
      { onConflict: "key" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Pages are server-rendered and cached; without this the change would not show
  // until the cache happened to expire.
  /* The pages are rebuilt, and the row cache behind them dropped -
     otherwise the new wording would sit behind a stale copy. */
  revalidateTag("content", "max");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, saved: clean.length });
}
