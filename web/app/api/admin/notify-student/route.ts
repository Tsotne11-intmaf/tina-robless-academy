import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { layout, sendBatch } from "@/lib/mail";
import { CATALOG } from "@/lib/catalog";

export const maxDuration = 30;
const SITE = "https://www.tinarobless.com";

type Body = { kind?: string; userId?: string; courseId?: string; ref?: string; note?: string };

/* One student, one thing that just happened to them.

   Sent when the admin hands over a course or finishes checking a piece of
   homework, so the student hears about it instead of having to keep checking
   the cabinet. Runs inside the admin's own session, so the same RLS that lets
   the panel read profiles applies here too.

   These are account notices about something the student asked for, not
   marketing, so marketing_ok is deliberately not consulted - turning off
   newsletters must not also silence "your homework has been marked". */
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

  const kind = b.kind === "granted" || b.kind === "graded" ? b.kind : null;
  if (!kind || !b.userId) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email,full_name")
    .eq("id", b.userId)
    .maybeSingle();
  if (!profile?.email) {
    return NextResponse.json({ ok: true, sent: 0, note: "ელფოსტა არ მოიძებნა" });
  }

  const name = (profile.full_name as string) || (profile.email as string).split("@")[0];

  /* The note is whatever the admin typed. It is dropped into an HTML mail, so
     it is escaped here rather than trusted - a stray < would otherwise swallow
     the rest of the message. */
  const note = b.note ? escapeHtml(b.note).replace(/\r?\n/g, "<br>") : undefined;
  const course = CATALOG.find((c) => c.id === b.courseId);

  /* The reference is what makes a repeat harmless: a fresh grant is a new
     enrollment row, and a re-marked submission only counts as new when the
     verdict changed. Pressing save twice on the same result sends nothing. */
  const ref = `${b.ref ?? ""}`;
  const { data: claimed } = await supabase
    .from("email_log")
    .upsert(
      [{ user_id: b.userId, kind, ref }],
      { onConflict: "user_id,kind,ref", ignoreDuplicates: true }
    )
    .select("user_id");
  if (!claimed?.length) return NextResponse.json({ ok: true, sent: 0, note: "უკვე გაგზავნილია" });

  const html =
    kind === "granted"
      ? layout({
          heading: `${name}, კურსი გახსნილია`,
          lead: course
            ? `თქვენს კაბინეტში დაემატა <strong style="color:#2B0F1F;">${course.title}</strong>. შეგიძლიათ ახლავე დაიწყოთ სწავლა.`
            : "თქვენს კაბინეტში ახალი კურსი დაემატა. შეგიძლიათ ახლავე დაიწყოთ სწავლა.",
          ctaLabel: "კურსის დაწყება",
          ctaHref: `${SITE}/dashboard`,
          note,
        })
      : layout({
          heading: `${name}, თქვენი დავალება შემოწმდა`,
          lead: course
            ? `„${course.title}" — თინამ ნახა თქვენი ნამუშევარი და დატოვა შეფასება.`
            : "თინამ ნახა თქვენი ნამუშევარი და დატოვა შეფასება.",
          ctaLabel: "შეფასების ნახვა",
          ctaHref: `${SITE}/hw`,
          note,
        });

  const subject =
    kind === "granted"
      ? course
        ? `კურსი გახსნილია: ${course.title}`
        : "თქვენი კურსი გახსნილია"
      : "თქვენი დავალება შემოწმდა";

  const { sent, error } = await sendBatch([{ to: profile.email as string, subject, html }]);
  if (error) {
    await supabase.from("email_log").delete().eq("user_id", b.userId).eq("kind", kind).eq("ref", ref);
    return NextResponse.json({ error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sent });
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
function escapeHtml(text: string) {
  return text.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);
}
