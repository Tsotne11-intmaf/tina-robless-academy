import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

type Body = { list?: string; action?: string; id?: string };

const LIST = /^list\.[a-z][a-z0-9.]{1,40}$/;

const SEEDS: Record<string, Record<string, string>> = {
  "list.awards": {
    year: "წელი",
    title: "ახალი ჩანაწერი",
    text: "აღწერა — დააჭირეთ და შეცვალეთ.",
  },
};

/* Growing or shortening one of the repeating lists.
 *
 * The list row holds ids in order; the wording of each entry lives in ordinary
 * content keys, so a new entry is editable the moment it exists without this
 * route knowing anything about what an award looks like. A new entry is seeded
 * with placeholder wording rather than left blank, because an empty row on the
 * page gives nothing to click on. */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return NextResponse.json({ error: "წვდომა აკრძალულია" }, { status: 403 });

  let b: Body;
  try {
    b = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const list = String(b.list ?? "");
  if (!LIST.test(list)) return NextResponse.json({ error: "bad list" }, { status: 400 });

  const { data: row } = await supabase.from("content").select("value").eq("key", list).maybeSingle();
  let ids: string[] = [];
  try {
    const parsed = JSON.parse((row?.value as string) ?? "[]");
    if (Array.isArray(parsed)) ids = parsed.filter((x) => typeof x === "string");
  } catch {
    ids = [];
  }

  if (b.action === "add") {
    if (ids.length >= 60) {
      return NextResponse.json({ error: "სია გაივსო" }, { status: 400 });
    }
    // Time-based so ids never repeat and the order of creation is readable.
    const id = "e" + Date.now().toString(36);
    ids.push(id);

    const seed = SEEDS[list] ?? { title: "ახალი ჩანაწერი" };
    const rows = Object.entries(seed).map(([field, value]) => ({
      key: `${list}.${id}.${field}`,
      value,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }));
    const { error } = await supabase.from("content").upsert(rows, { onConflict: "key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (b.action === "remove") {
    const id = String(b.id ?? "");
    if (!/^[a-z0-9]{2,30}$/.test(id)) {
      return NextResponse.json({ error: "bad id" }, { status: 400 });
    }
    ids = ids.filter((x) => x !== id);
    // Drop the entry's own wording too, so a removed award leaves nothing behind.
    await supabase.from("content").delete().like("key", `${list}.${id}.%`);
    await supabase.from("content").delete().eq("key", `img.${list}.${id}`);
  } else {
    return NextResponse.json({ error: "bad action" }, { status: 400 });
  }

  const { error } = await supabase.from("content").upsert(
    {
      key: list,
      value: JSON.stringify(ids),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "key" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, count: ids.length });
}
