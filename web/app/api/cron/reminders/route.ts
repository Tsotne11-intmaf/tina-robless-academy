import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { layout, sendBatch, type Message } from "@/lib/mail";
import { COURSES } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAYS_AWAY = 6;
const SITE = "https://www.tinarobless.com";

/* Runs once a day from Vercel's scheduler.

   Finds students who paid for a course and then stopped coming, and sends one
   reminder - one, not one a day, which is what makes the email_log table the
   important part of this file rather than an afterthought. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail closed. Without a secret configured this endpoint would be a public URL
  // that anyone could hit repeatedly to fire mail at every student.
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY missing" }, { status: 503 });
  }

  const cutoff = new Date(Date.now() - DAYS_AWAY * 86400_000);

  // Only people who actually own something. There is nothing to come back to
  // otherwise, and nudging someone who never bought a course is just spam.
  const { data: enrolments, error: enrErr } = await supabase
    .from("enrollments")
    .select("profile_id,course_id,expires_at");
  if (enrErr) return NextResponse.json({ error: enrErr.message }, { status: 500 });

  const now = Date.now();
  const owned = new Map<string, string[]>();
  for (const e of enrolments ?? []) {
    if (e.expires_at && new Date(e.expires_at).getTime() < now) continue;
    owned.set(e.profile_id, [...(owned.get(e.profile_id) ?? []), e.course_id]);
  }
  if (!owned.size) return NextResponse.json({ ok: true, sent: 0, reason: "no enrolments" });

  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id,email,full_name,last_seen_at,unsub_token")
    .in("id", [...owned.keys()]);
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

  type Candidate = { id: string; email: string; name: string; ref: string; token: string; course: string };
  const candidates: Candidate[] = [];
  for (const p of profiles ?? []) {
    if (!p.email) continue;
    const seen = p.last_seen_at ? new Date(p.last_seen_at) : null;
    if (seen && seen > cutoff) continue;
    /* The reference is the visit being reminded about. Tying it to the last
       visit rather than to the day the job runs is what limits this to one
       reminder per absence: the next one only becomes possible after they come
       back and leave again. */
    candidates.push({
      id: p.id,
      email: p.email,
      name: (p.full_name as string) || p.email.split("@")[0],
      ref: seen ? seen.toISOString().slice(0, 10) : "never",
      token: p.unsub_token as string,
      course: owned.get(p.id)?.[0] ?? "",
    });
  }
  if (!candidates.length) return NextResponse.json({ ok: true, sent: 0 });

  /* Claim the sends before making them. The unique index means a second run -
     a retry, an overlap, a manual trigger - gets back nothing for anyone
     already claimed, so nobody is emailed twice. */
  const { data: claimed, error: logErr } = await supabase
    .from("email_log")
    .upsert(
      candidates.map((c) => ({ user_id: c.id, kind: "inactive", ref: c.ref })),
      { onConflict: "user_id,kind,ref", ignoreDuplicates: true }
    )
    .select("user_id");
  if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });

  const claimedIds = new Set((claimed ?? []).map((r) => r.user_id));
  const toSend = candidates.filter((c) => claimedIds.has(c.id));
  if (!toSend.length) return NextResponse.json({ ok: true, sent: 0, note: "all already sent" });

  const titleOf = (id: string) =>
    (COURSES as Array<{ id: string; title: string }>).find((c) => c.id === id)?.title ?? "";

  const messages: Message[] = toSend.map((c) => {
    const course = titleOf(c.course);
    return {
      to: c.email,
      subject: "თქვენი კურსი გელოდებათ — Tina Robless Nail Academy",
      html: layout({
        heading: `${c.name}, დიდი ხანია არ შემოსულხართ`,
        lead: course
          ? `„${course}" თქვენს კაბინეტში გელოდებათ. სწავლა იქიდან გააგრძელეთ, სადაც შეწყვიტეთ — პროგრესი შენახულია.`
          : "თქვენი კურსი კაბინეტში გელოდებათ. სწავლა იქიდან გააგრძელეთ, სადაც შეწყვიტეთ.",
        ctaLabel: "კაბინეტში შესვლა",
        ctaHref: `${SITE}/dashboard`,
        note: "კვირაში სულ რამდენიმე გაკვეთილიც კი საკმარისია რომ ტემპი არ დაიკარგოს.",
        unsubToken: c.token,
      }),
    };
  });

  const { sent, error } = await sendBatch(messages);
  if (error) {
    /* Give back what could not be sent, so the next run tries again rather than
       leaving these people silently skipped forever. */
    await supabase
      .from("email_log")
      .delete()
      .eq("kind", "inactive")
      .in("user_id", toSend.slice(sent).map((c) => c.id));
    return NextResponse.json({ error, sent }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sent });
}
