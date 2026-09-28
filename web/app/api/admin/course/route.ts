import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATALOG } from "@/lib/catalog";

export const maxDuration = 30;

type Body = {
  id?: string;
  cat?: string;
  title?: string;
  dur?: string;
  price?: string;
  was?: string;
  descr?: string;
  photo?: string;
  video?: string;
  badge?: string;
  featured?: boolean;
  hidden?: boolean;
  sort?: number | null;
};

const ID = /^[a-z0-9][a-z0-9-]{1,40}$/;

/* Adds a course or changes one.

   A row here is an override, not the whole catalogue: the thirteen courses the
   site launched with stay in the code, and a field left empty means "keep what
   the code says". That is what lets a price change be a price change rather
   than a retyping of the whole course. */
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

  const id = String(b.id ?? "").trim().toLowerCase();
  if (!ID.test(id)) {
    return NextResponse.json(
      { error: "მისამართი უნდა იყოს ლათინური ასოები, ციფრები და ტირე (მაგ. french-pro)" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  const creating = !CATALOG.some((c) => c.id === id) && !existing;
  // A brand-new course has nothing in the code to fall back on, so it has to
  // arrive complete enough to render a card.
  if (creating && (!b.title?.trim() || !b.price?.trim())) {
    return NextResponse.json({ error: "ახალ კურსს სჭირდება სახელი და ფასი" }, { status: 400 });
  }

  const text = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s.slice(0, 4000);
  };

  /* Only what was actually sent is written.
   *
   * Hiding a course posts nothing but its id and the flag, and every column
   * missing from the payload used to be overwritten with null - so putting a
   * course away quietly erased the title, price and description it was put away
   * with, and a course added from the panel came back empty. A field absent from
   * the request now means "leave it", the same thing an empty column already
   * means to the catalogue. */
  const has = (k: keyof Body) => Object.prototype.hasOwnProperty.call(b, k);
  const row: Record<string, unknown> = {
    id,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };
  const TEXT = ["cat", "title", "dur", "price", "was", "descr", "photo", "video", "badge"] as const;
  for (const k of TEXT) if (has(k)) row[k] = text(b[k]);
  if (has("featured")) row.featured = b.featured ?? null;
  if (has("hidden")) row.hidden = b.hidden === true;
  if (has("sort")) row.sort = typeof b.sort === "number" ? b.sort : null;

  const { error } = await supabase.from("courses").upsert(row, { onConflict: "id" });

  if (error) {
    const missing = error.code === "42P01" || /courses/.test(error.message);
    return NextResponse.json(
      { error: missing ? "კურსების ცხრილი ჯერ არ არის შექმნილი ბაზაში." : error.message },
      { status: 400 }
    );
  }

  // The catalogue is server-rendered on the home page, the list and each course.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, id, created: creating });
}
