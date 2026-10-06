import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { layout, sendBatch } from "@/lib/mail";

export const maxDuration = 60;

type Body = {
  audience?: string;
  courseId?: string;
  subject?: string;
  message?: string;
};

/* A letter Tina writes herself, to a group she picks.
 *
 * The only announcement that existed was the fixed "a new course is out" one,
 * sent to whoever had ticked the newsletter box - so there was no way to tell
 * students anything else, and no field to say it in.
 *
 * Who each audience actually is:
 *   all        - every account. Service news: a change of schedule, a closure.
 *   course     - the people holding one course. About that course.
 *   subscribers- only those who agreed to hear about new things. Marketing.
 *
 * Nothing is deduplicated here, unlike the course announcement: the same words
 * may legitimately be sent twice, and a repeat is the sender's decision. */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

  const subject = String(b.subject ?? "").trim();
  const message = String(b.message ?? "").trim();
  if (!subject) return NextResponse.json({ error: "სათაური აუცილებელია" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "ტექსტი აუცილებელია" }, { status: 400 });
  if (message.length > 4000) {
    return NextResponse.json({ error: "ტექსტი ძალიან გრძელია" }, { status: 400 });
  }

  const audience = b.audience === "course" || b.audience === "subscribers" ? b.audience : "all";

  let query = supabase.from("profiles").select("id,email,full_name");
  if (audience === "subscribers") query = query.eq("marketing_ok", true);

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let people = (rows ?? []).filter((p) => p.email);

  if (audience === "course") {
    const courseId = String(b.courseId ?? "");
    if (!courseId) return NextResponse.json({ error: "აირჩიეთ კურსი" }, { status: 400 });
    const { data: enrolled } = await supabase
      .from("enrollments")
      .select("profile_id")
      .eq("course_id", courseId);
    const ids = new Set((enrolled ?? []).map((e) => e.profile_id as string));
    people = people.filter((p) => ids.has(p.id as string));
  }

  if (!people.length) return NextResponse.json({ ok: true, sent: 0, note: "მიმღები არ მოიძებნა" });

  // Line breaks are the only formatting; everything else is escaped.
  const html = message
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 14px;">${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const { sent, error: mailErr } = await sendBatch(
    people.map((p) => ({
      to: p.email as string,
      subject,
      html: layout({
        heading: subject,
        lead: html,
        ctaLabel: "საიტზე გადასვლა",
        ctaHref: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tinarobless.com",
      }),
    }))
  );

  if (mailErr) return NextResponse.json({ error: mailErr, sent }, { status: 502 });
  return NextResponse.json({ ok: true, sent, total: people.length });
}
