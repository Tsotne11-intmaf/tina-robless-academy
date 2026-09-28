import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { CATALOG, type CourseItem } from "@/lib/catalog";

export type Course = CourseItem & { video?: string | null; featured?: boolean; hidden?: boolean };

type Row = {
  id: string;
  cat: string | null;
  title: string | null;
  dur: string | null;
  price: string | null;
  was: string | null;
  descr: string | null;
  photo: string | null;
  video: string | null;
  badge: string | null;
  access: string | null;
  access_days: number | null;
  featured: boolean | null;
  sort: number | null;
  hidden: boolean;
};

/* The catalogue as the site should show it: what ships in the code, with the
   owner's changes and additions on top.

   The thirteen original courses stay in the code. They are complete and
   translated, and the site renders them with no database at all - so a database
   hiccup costs the catalogue nothing. A row in `courses` either overrides fields
   of one of them by id or introduces a course that was never in the code.

   Null in a column means "leave what the code says", which is what lets her
   change a price without restating the title. */
const rowsOf = cache(async (): Promise<Row[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("courses").select("*");
    return !error && data ? (data as Row[]) : [];
  } catch {
    return [];
  }
});

function build(rows: Row[], keepHidden: boolean): Course[] {
  const byId = new Map<string, Row>(rows.map((r) => [r.id, r]));
  const out: Course[] = [];

  for (const base of CATALOG as Course[]) {
    const r = byId.get(base.id);
    byId.delete(base.id);
    if (r?.hidden && !keepHidden) continue;
    const c = r ? merge(base, r) : base;
    out.push(keepHidden ? { ...c, hidden: !!r?.hidden } : c);
  }

  // Whatever is left was added by the owner and has no counterpart in the code.
  for (const r of byId.values()) {
    if (r.hidden && !keepHidden) continue;
    const c = merge(blank(r.id), r);
    out.push(keepHidden ? { ...c, hidden: r.hidden } : c);
  }

  /* sort when she has set one, otherwise the order the code lists them in, which
     is the order the site launched with. */
  return out
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const sa = a.c.order ?? null;
      const sb = b.c.order ?? null;
      if (sa !== null && sb !== null && sa !== sb) return sa - sb;
      if (sa !== null && sb === null) return -1;
      if (sa === null && sb !== null) return 1;
      return a.i - b.i;
    })
    .map((x) => x.c);
}

export const getCatalog = cache(async (): Promise<Course[]> => build(await rowsOf(), false));

/* The same catalogue with the hidden courses left in, for the admin list. A
   course she cannot see is a course she cannot bring back, so hiding one was a
   one-way door. */
export const getCatalogAll = cache(async (): Promise<Course[]> => build(await rowsOf(), true));

/* The front-page top row. Courses she has marked, or - until she marks any -
   the six the site launched with, so the row is never empty. */
const LAUNCH_FEATURED = ["master-1", "master-2", "french", "extreme", "crystals", "money"];

export function featured(list: Course[]): Course[] {
  const chosen = list.filter((c) => c.featured);
  if (chosen.length) return chosen;
  return list.filter((c) => LAUNCH_FEATURED.includes(c.id));
}

export async function courseById(id: string): Promise<Course | undefined> {
  return (await getCatalog()).find((c) => c.id === id);
}

function merge(base: Course, r: Row): Course {
  const pick = <T,>(v: T | null | undefined, fallback: T): T =>
    v === null || v === undefined || v === ("" as unknown as T) ? fallback : v;
  return {
    ...base,
    cat: pick(r.cat, base.cat),
    title: pick(r.title, base.title),
    dur: pick(r.dur, base.dur),
    price: pick(r.price, base.price),
    was: pick(r.was, base.was),
    desc: pick(r.descr, base.desc),
    photo: pick(r.photo, base.photo ?? null),
    video: pick(r.video, base.video ?? null),
    badge: pick(r.badge, base.badge ?? null),
    access: pick(r.access, base.access),
    accessDays: pick(r.access_days, base.accessDays),
    featured: r.featured ?? base.featured,
    order: r.sort ?? base.order,
  };
}

function blank(id: string): Course {
  return { id, cat: "technique", title: id, dur: "", price: "", desc: "" };
}
