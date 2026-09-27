import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { layout, sendBatch, type Message } from "@/lib/mail";
import { CATALOG } from "@/lib/catalog";

export const maxDuration = 60;
const SITE = "https://www.tinarobless.com";

/* Announces one course to the students who agreed to hear about them.

   No service role here, unlike the nightly job: this runs inside the admin's own
   request, so reading every profile is allowed by the same RLS policy that lets
   the admin panel list them, and a non-admin calling this URL directly simply
   gets nothing back to send to. is_admin() is still checked first so the answer
   is a clear 403 rather than a confusing empty success. */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return NextResponse.json({ error: "წვდომა აკრძალულია" }, { status: 403 });

  let courseId = "";
  try {
    courseId = String(((await request.json()) as { courseId?: unknown }).courseId ?? "");
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const course = CATALOG.find((c) => c.id === courseId);
  if (!course) return NextResponse.json({ error: "ასეთი კურსი არ არსებობს" }, { status: 400 });

  // Only those who ticked the box. Everyone else is simply not in this list.
  const { data: recipients, error: recErr } = await supabase
    .from("profiles")
    .select("id,email,full_name,unsub_token")
    .eq("marketing_ok", true);
  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 });

  const people = (recipients ?? []).filter((p) => p.email);
  if (!people.length) return NextResponse.json({ ok: true, sent: 0, note: "მიმღები არ მოიძებნა" });

  /* Same claim-then-send as the nightly job, keyed on the course, so pressing
     the button twice does not mail the same announcement twice. */
  const { data: claimed, error: logErr } = await supabase
    .from("email_log")
    .upsert(
      people.map((p) => ({ user_id: p.id, kind: "new_course", ref: courseId })),
      { onConflict: "user_id,kind,ref", ignoreDuplicates: true }
    )
    .select("user_id");
  if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });

  const claimedIds = new Set((claimed ?? []).map((r) => r.user_id));
  const toSend = people.filter((p) => claimedIds.has(p.id));
  if (!toSend.length) {
    return NextResponse.json({ ok: true, sent: 0, note: "ეს კურსი უკვე გაგზავნილია" });
  }

  const messages: Message[] = toSend.map((p) => ({
    to: p.email as string,
    subject: `ახალი კურსი: ${course.title}`,
    html: layout({
      heading: "ახალი კურსი აკადემიაში",
      lead: `<strong style="color:#2B0F1F;">${course.title}</strong><br>${course.desc}`,
      ctaLabel: "კურსის ნახვა",
      ctaHref: `${SITE}/kurs/${course.id}`,
      note: `ხანგრძლივობა: ${course.dur} · ფასი: ${course.price}`,
      unsubToken: p.unsub_token as string,
    }),
  }));

  const { sent, error } = await sendBatch(messages);
  if (error) {
    await supabase
      .from("email_log")
      .delete()
      .eq("kind", "new_course")
      .eq("ref", courseId)
      .in("user_id", toSend.slice(sent).map((p) => p.id));
    return NextResponse.json({ error, sent }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sent });
}
