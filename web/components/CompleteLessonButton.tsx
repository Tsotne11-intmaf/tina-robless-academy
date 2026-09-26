"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* Marks a lesson finished, which is what unlocks the next one.

   The write lands in the progress table, whose policy only accepts a row for a
   course the student is currently enrolled in and whose access has not lapsed. So
   nobody can unlock a course by posting progress for it - the database refuses. */
export default function CompleteLessonButton({
  courseId,
  lessonIndex,
  totalLessons,
  alreadyDone,
  nextIndex,
}: {
  courseId: string;
  lessonIndex: number;
  totalLessons: number;
  alreadyDone: boolean;
  nextIndex: number | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function complete() {
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
    // Never move progress backwards if a student revisits an earlier lesson.
    const newCount = Math.min(Math.max(lessonIndex + 1, 0), totalLessons);
    const { error } = await supabase.from("progress").upsert(
      {
        profile_id: user.id,
        course_id: courseId,
        lessons_done: newCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,course_id" }
    );
    setBusy(false);
    if (error) {
      setErr("ვერ შეინახა: " + error.message);
      return;
    }
    router.push(nextIndex !== null ? `/lesson/${courseId}/${nextIndex}` : `/course/${courseId}`);
    router.refresh();
  }

  if (alreadyDone) {
    return nextIndex !== null ? (
      <a className="btn btn-plum" href={`/lesson/${courseId}/${nextIndex}`}>
        შემდეგი →
      </a>
    ) : (
      <a className="btn btn-plum" href={`/course/${courseId}`}>
        კურსზე დაბრუნება
      </a>
    );
  }

  return (
    <>
      <button className="btn btn-plum" onClick={complete} disabled={busy}>
        {busy ? "ინახება…" : "დასრულებულად მონიშვნა"}
      </button>
      {err ? <p className="auth-msg bad">{err}</p> : null}
    </>
  );
}
