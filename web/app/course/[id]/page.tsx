import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getStudent, ownedCourses, courseById, flatLessons, percent } from "@/lib/student";
import StudentSidebar from "@/components/StudentSidebar";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudent();
  if (!student) redirect(`/login?next=/course/${id}`);

  const course = courseById(id);
  if (!course) notFound();

  /* Ownership decided on the server. A student who types a course URL they have not
     bought is sent back to the dashboard before any lesson title is rendered. */
  if (!student.owned.includes(id)) redirect("/dashboard");

  const lessons = flatLessons(course);
  const doneCount = student.done[id] ?? 0;
  const p = percent(course, student.done);

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={ownedCourses(student)} active={id} />
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>{course.title}</h1>
          <p className="lead" style={{ marginBottom: 18 }}>
            {lessons.length} გაკვეთილი · დასრულებული {doneCount} ({p}%)
          </p>
          <div className="progress" style={{ marginBottom: 30 }}>
            <i style={{ width: p + "%" }} />
          </div>

          {course.modules.map((m, mi) => {
            // running index of the first lesson in this module
            const before = course.modules
              .slice(0, mi)
              .reduce((n, x) => n + x.lessons.length, 0);
            return (
              <div key={mi} style={{ marginBottom: 26 }}>
                <h2 style={{ fontSize: "1.3rem", marginBottom: 10 }}>{m.title}</h2>
                <div className="adm-list">
                  {m.lessons.map((l, li) => {
                    const idx = before + li;
                    // Sequential unlocking, as in the legacy LMS: the next lesson
                    // opens only once the previous one is marked done.
                    const unlocked = idx <= doneCount;
                    const complete = idx < doneCount;
                    return (
                      <div className="adm-row" key={li}>
                        <div className="adm-main">
                          <b>
                            {idx + 1}. {l.t}
                          </b>
                          {l.d ? <span>{l.d}</span> : null}
                        </div>
                        <div className="adm-btns">
                          {complete ? (
                            <span style={{ color: "var(--plum)", fontSize: ".85rem" }}>✓ დასრულებული</span>
                          ) : null}
                          {unlocked ? (
                            <Link className="btn btn-ghost" href={`/lesson/${id}/${idx}`}>
                              {complete ? "გადახედვა" : "გახსნა"}
                            </Link>
                          ) : (
                            <span style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>
                              🔒 დაბლოკილია
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
