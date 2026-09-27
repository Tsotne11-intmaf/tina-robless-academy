import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { layout, sendBatch } from "@/lib/mail";
import { CATALOG } from "@/lib/catalog";

export const maxDuration = 30;
const SITE = "https://www.tinarobless.com";

type Body = { userId?: string; courseId?: string; title?: string; task?: string; due?: string };

/* Sets one student a task of Tina's own wording.

   The catalogue's HOMEWORK list is per course, so every owner of a course sees
   the same exercises and there was no way to say "you, do this one". These rows
   are per student, and the row is written before the email goes out: the task
   must exist in the cabinet by the time the student follows the link. */
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

  const title = String(b.title ?? "").trim();
  const task = String(b.task ?? "").trim();
  if (!b.userId || !b.courseId || !title || !task) {
    return NextResponse.json({ error: "შეავსეთ სათაური და დავალება" }, { status: 400 });
  }

  const course = CATALOG.find((c) => c.id === b.courseId);
  if (!course) return NextResponse.json({ error: "ასეთი კურსი არ არსებობს" }, { status: 400 });

  const due = b.due ? new Date(b.due) : null;

  const { data: row, error: insErr } = await supabase
    .from("assignments")
    .insert({
      profile_id: b.userId,
      course_id: b.courseId,
      title,
      task,
      due_at: due && !isNaN(due.getTime()) ? due.toISOString() : null,
    })
    .select("id")
    .maybeSingle();

  if (insErr) {
    /* The table is created from the dashboard rather than by the app, so say so
       plainly instead of showing a raw PostgREST message to whoever is using the
       panel. */
    const missing = insErr.code === "42P01" || /assignments/.test(insErr.message);
    return NextResponse.json(
      {
        error: missing
          ? "დავალებების ცხრილი ჯერ არ არის შექმნილი ბაზაში."
          : insErr.message,
      },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email,full_name")
    .eq("id", b.userId)
    .maybeSingle();

  if (!profile?.email) return NextResponse.json({ ok: true, sent: 0, id: row?.id });

  const name = (profile.full_name as string) || (profile.email as string).split("@")[0];
  const when = due && !isNaN(due.getTime()) ? due.toLocaleDateString("ka-GE") : null;

  const { sent, error } = await sendBatch([
    {
      to: profile.email as string,
      subject: `ახალი დავალება: ${title}`,
      html: layout({
        heading: `${name}, თინამ დაგავალათ`,
        lead: `<strong style="color:#2B0F1F;">${esc(title)}</strong><br>${esc(task).replace(/\r?\n/g, "<br>")}`,
        ctaLabel: "დავალების ნახვა",
        ctaHref: `${SITE}/hw`,
        note: `კურსი: ${course.title}${when ? ` · ვადა: ${when}` : ""}`,
        preview: title,
      }),
    },
  ]);

  // The task is saved either way; a mail problem must not undo it.
  return NextResponse.json({ ok: true, id: row?.id, sent, mailError: error ?? null });
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(text: string) {
  return text.replace(/[&<>"]/g, (c) => ESCAPES[c]);
}
