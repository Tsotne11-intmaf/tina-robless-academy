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

  const isNew = !CATALOG.some((c) => c.id === id);
  // A brand-new course has nothing in the code to fall back on, so it has to
  // arrive complete enough to render a card.
  if (isNew && (!b.title?.trim() || !b.price?.trim())) {
    return NextResponse.json({ error: "ახალ კურსს სჭირდება სახელი და ფასი" }, { status: 400 });
  }

  const text = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s.slice(0, 4000);
  };

  const { error } = await supabase.from("courses").upsert(
    {
      id,
      cat: text(b.cat),
      title: text(b.title),
      dur: text(b.dur),
      price: text(b.price),
      was: text(b.was),
      descr: text(b.descr),
      photo: text(b.photo),
      video: text(b.video),
      badge: text(b.badge),
      featured: b.featured ?? null,
      hidden: b.hidden ?? false,
      sort: typeof b.sort === "number" ? b.sort : null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "id" }
  );

  if (error) {
    const missing = error.code === "42P01" || /courses/.test(error.message);
    return NextResponse.json(
      { error: missing ? "კურსების ცხრილი ჯერ არ არის შექმნილი ბაზაში." : error.message },
      { status: 400 }
    );
  }

  // The catalogue is server-rendered on the home page, the list and each course.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, id, created: isNew });
}
