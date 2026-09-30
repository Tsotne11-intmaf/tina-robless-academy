import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getStudent, ownedCourses, courseById, flatLessons } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import { playerFor } from "@/lib/video";
import StudentSidebar from "@/components/StudentSidebar";
import CompleteLessonButton from "@/components/CompleteLessonButton";
import { waitingHomework } from "@/lib/homework";

/* The whole point of the migration lives in this file.

   In the single-file version every lesson of every course was inside the HTML that
   went to every visitor, and the ownership check ran in the browser afterwards.
   Anyone could read the entire course in view-source without paying.

   Here the server checks enrolment first and only then renders the lesson. A
   student who has not bought this course never receives its content at all. */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; n: string }>;
}) {
  const { id, n } = await params;
  const student = await getStudent();
  if (!student) redirect(`/login?next=/lesson/${id}/${n}`);

  const course = courseById(id);
  if (!course) notFound();
  if (!student.owned.includes(id)) redirect("/dashboard");

  const lessons = flatLessons(course);
  const idx = Number.parseInt(n, 10);
  if (!Number.isFinite(idx) || idx < 0 || idx >= lessons.length) notFound();

  const doneCount = student.done[id] ?? 0;
  // Sequential unlocking is enforced here too, not just hidden in the list.
  if (idx > doneCount) redirect(`/course/${id}`);

  const lesson = lessons[idx];

  /* Read after the ownership check above, never before. The select policy says
     the same thing again in the database, so a reference cannot be fetched by
     someone who has not bought the course even if this page were wrong. */
  const supabase = await createClient();
  const { data: vid } = await supabase
    .from("lesson_videos")
    .select("url")
    .eq("course_id", id)
    .eq("lesson_index", idx)
    .maybeSingle();
  const player = playerFor(vid?.url);
  const prev = idx > 0 ? idx - 1 : null;
  const next = idx + 1 < lessons.length ? idx + 1 : null;
  const alreadyDone = idx < doneCount;

  const waiting = (await waitingHomework(student)).count;

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={ownedCourses(student)} active={id} waiting={waiting} />
        <div>
          <div className="crumbs">
            <Link href="/dashboard">ჩემი კურსები</Link> /{" "}
            <Link href={`/course/${id}`}>{course.title}</Link>
          </div>

          <p className="lead" style={{ marginBottom: 4 }}>{lesson.mt}</p>
          <h1 style={{ fontSize: "2rem", marginBottom: 14 }}>
            {idx + 1}. {lesson.t}
          </h1>

          {/* The file lives with a video host, not in the database. What is kept
              here is the reference, resolved into a player above. */}
          <div className="video">
            {player === null ? (
              <div className="video-empty">ამ გაკვეთილს ვიდეო ჯერ არ აქვს</div>
            ) : player.kind === "iframe" ? (
              <iframe
                src={player.src}
                title={lesson.t}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={player.src} controls controlsList="nodownload" playsInline />
            )}
          </div>

          {lesson.d ? <p className="lead">{lesson.d}</p> : null}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            {prev !== null ? (
              <Link className="btn btn-ghost" href={`/lesson/${id}/${prev}`}>
                ← წინა
              </Link>
            ) : null}
            <CompleteLessonButton
              courseId={id}
              lessonIndex={idx}
              totalLessons={lessons.length}
              alreadyDone={alreadyDone}
              nextIndex={next}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
