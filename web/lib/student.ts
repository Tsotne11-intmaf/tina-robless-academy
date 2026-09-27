import { createClient } from "@/lib/supabase/server";
import { COURSES } from "@/lib/catalog";

export type Lesson = { t: string; d?: string };
export type Module = { title: string; lessons: Lesson[] };
export type StudentCourse = {
  id: string;
  title: string;
  hours?: number;
  modules: Module[];
};

export type Student = {
  userId: string;
  email: string;
  name: string;
  profile: Record<string, unknown> | null;
  owned: string[];
  expires: Record<string, string | null>;
  done: Record<string, number>;
  isAdmin: boolean;
};

/* One round trip for everything the cabinet needs.

   Ownership is never decided here. The enrollments select policy only returns rows
   that have not expired, so an out-of-date course simply does not come back and the
   student loses access without this file testing a date. In the single-file version
   that check ran on the student's own machine, where clearing storage or moving the
   clock defeated it. */
export async function getStudent(): Promise<Student | null> {
  const supabase = await createClient();

  /* The same distinction the proxy makes, applied where it actually matters.

     Every protected page sends whoever this returns null for to the login
     screen, so a timed-out or 5xx answer from Supabase - which is a network
     problem, not a verdict - would throw out a student whose cookies are
     perfectly good. A definite refusal still ends the session; only the
     inconclusive case is asked again. */
  let { data: { user }, error } = await supabase.auth.getUser();
  if (!user && isInconclusive(error)) {
    ({ data: { user }, error } = await supabase.auth.getUser());
  }
  if (!user) return null;

  const [profileRes, enrRes, progRes, adminRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("enrollments").select("course_id,expires_at"),
    supabase.from("progress").select("course_id,lessons_done"),
    supabase.rpc("is_admin"),
  ]);

  const enrollments = enrRes.data ?? [];
  const expires: Record<string, string | null> = {};
  for (const e of enrollments) expires[e.course_id] = e.expires_at;

  const done: Record<string, number> = {};
  for (const p of progRes.data ?? []) done[p.course_id] = p.lessons_done;

  const profile = profileRes.data ?? null;

  /* Record that they were here, at most once an hour.

     This is what the reminder job reads, and it has to be a visit rather than a
     sign-in: sessions last for weeks, so someone who bought a course, signed in
     once and never returned would otherwise look recently active forever. The
     hourly throttle keeps it from becoming a database write on every page. */
  const lastSeen = profile?.last_seen_at as string | null | undefined;
  if (!lastSeen || Date.now() - new Date(lastSeen).getTime() > 3600_000) {
    await supabase.rpc("touch_last_seen");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    name:
      (profile?.full_name as string) ||
      (user.user_metadata?.full_name as string) ||
      (user.email ?? "").split("@")[0],
    profile,
    owned: enrollments.map((e) => e.course_id),
    expires,
    done,
    /* Asked through is_admin(), never by reading the admins table.

       The table has RLS enabled and no policy at all, which denies every client
       equally - a real admin included. Selecting from it here therefore always came
       back empty, so isAdmin was permanently false and the panel could not be
       reached no matter who signed in. is_admin() is SECURITY DEFINER precisely so
       it can look inside a table the caller cannot, and it is the same function the
       row policies use, so the badge and the actual permissions cannot disagree. */
    isAdmin: adminRes.data === true,
  };
}

export function courseById(id: string): StudentCourse | undefined {
  return (COURSES as unknown as StudentCourse[]).find((c) => c.id === id);
}

/** Flattens modules into a single ordered lesson list, as the legacy LMS.flat did. */
export function flatLessons(c: StudentCourse) {
  const out: Array<{ m: number; l: number; mt: string; t: string; d?: string }> = [];
  c.modules.forEach((m, mi) =>
    m.lessons.forEach((l, li) => out.push({ m: mi, l: li, mt: m.title, t: l.t, d: l.d }))
  );
  return out;
}

export function percent(c: StudentCourse, done: Record<string, number>) {
  const total = flatLessons(c).length;
  if (!total) return 0;
  return Math.round(((done[c.id] ?? 0) / total) * 100);
}

/** Courses the student actually owns, as full course objects. */
export function ownedCourses(s: Student): StudentCourse[] {
  return (COURSES as unknown as StudentCourse[]).filter((c) => s.owned.includes(c.id));
}

function isInconclusive(error: unknown): boolean {
  if (!error) return false;
  const status = (error as { status?: number }).status;
  return status === undefined || status === 0 || status === 429 || status >= 500;
}
