import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getStudent, ownedCourses, courseById, flatLessons } from "@/lib/student";
import { courseById as catalogueCourse } from "@/lib/catalog-db";
import { playerFor } from "@/lib/video";
import StudentSidebar from "@/components/StudentSidebar";
import CompleteCourseButton from "@/components/CompleteCourseButton";
import { waitingHomework } from "@/lib/homework";

/* A course, as one recording.

   It used to be a list of twenty lessons that unlocked one after another, each
   waiting for a video of its own. The lessons were fixed in the code, so Tina
   could neither retitle them nor change how the course was divided - and one
   recording is how she actually teaches. The stages now live in the course
   description, which she can edit, and the whole video plays here. */
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudent();
  if (!student) redirect(`/login?next=/course/${id}`);

  const course = courseById(id);
  if (!course) notFound();

  /* Ownership decided on the server. A student who types a course URL they have not
     bought is sent back to the dashboard before any of it is rendered. */
  if (!student.owned.includes(id)) redirect("/dashboard");

  const total = flatLessons(course).length;
  const done = total > 0 && (student.done[id] ?? 0) >= total;

  // The video and the wording come from the catalogue, where Tina edits them.
  const listed = await catalogueCourse(id);
  const player = playerFor(listed?.video);

  const waiting = (await waitingHomework(student)).count;

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={ownedCourses(student)} active={id} waiting={waiting} />
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>{listed?.title ?? course.title}</h1>
          {listed?.dur ? (
            <p className="lead" style={{ marginBottom: 18 }}>
              {listed.dur}
            </p>
          ) : null}

          <div className="video">
            {player === null ? (
              <div className="video-empty">ვიდეო მალე დაემატება</div>
            ) : player.kind === "iframe" ? (
              <iframe
                src={player.src}
                title={listed?.title ?? course.title}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={player.src}
                poster={listed?.photo ?? undefined}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
              />
            )}
          </div>

          {listed?.desc ? (
            <>
              <h2 style={{ fontSize: "1.3rem", margin: "6px 0 10px" }}>კურსის შესახებ</h2>
              <p className="lead course-desc">{listed.desc}</p>
            </>
          ) : null}

          {listed?.learn?.length ? (
            <>
              <h2 style={{ fontSize: "1.3rem", margin: "26px 0 10px" }}>რას ისწავლით</h2>
              <ul className="learn">
                {listed.learn.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </>
          ) : null}

          <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <CompleteCourseButton courseId={id} totalLessons={total || 1} done={done} />
            <Link className="btn btn-ghost" href="/hw">
              დავალებები
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
