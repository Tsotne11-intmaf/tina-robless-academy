"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* Marking the course finished.

   A course used to be finished one lesson at a time, which is what the progress
   row counts. There is one video now, so there is one moment to record - the
   count jumps to the whole course rather than climbing. The row policy still
   only accepts progress for a course the student is enrolled on. */
export default function CompleteCourseButton({
  courseId,
  totalLessons,
  done,
}: {
  courseId: string;
  totalLessons: number;
  done: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function mark(finished: boolean) {
    setBusy(true);
    setErr(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setErr("ავტორიზაცია საჭიროა");
      return;
    }
    const { error } = await supabase.from("progress").upsert(
      {
        profile_id: user.id,
        course_id: courseId,
        lessons_done: finished ? totalLessons : 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,course_id" }
    );
    setBusy(false);
    if (error) {
      setErr("ვერ შეინახა: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <>
      {done ? (
        <div className="done-row">
          <span className="done-tag">✓ კურსი დასრულებულია</span>
          <button className="btn btn-ghost" onClick={() => mark(false)} disabled={busy}>
            დასრულების მოხსნა
          </button>
        </div>
      ) : (
        <button className="btn btn-plum" onClick={() => mark(true)} disabled={busy}>
          {busy ? "ინახება…" : "კურსის დასრულებულად მონიშვნა"}
        </button>
      )}
      {err ? <p className="auth-msg bad">{err}</p> : null}
    </>
  );
}
