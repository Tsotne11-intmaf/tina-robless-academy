import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudent, ownedCourses, percent, flatLessons } from "@/lib/student";
import StudentSidebar from "@/components/StudentSidebar";

export const metadata = { title: "ჩემი სერტიფიკატები — Tina Robless Nail Academy" };

export default async function MyCertPage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/mycert");

  const mine = ownedCourses(student);
  // A certificate is earned, not stored: it exists exactly when every lesson is done.
  const earned = mine.filter((c) => percent(c, student.done) === 100);
  const inProgress = mine.filter((c) => percent(c, student.done) < 100);

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={mine} active="cert" />
        <div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>ჩემი სერტიფიკატები</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            სერტიფიკატი გაიცემა კურსის სრულად დასრულების შემდეგ.
          </p>

          {earned.length === 0 && inProgress.length === 0 ? (
            <div className="pcard" style={{ display: "block" }}>
              <h3 style={{ marginBottom: 6 }}>ჯერ არცერთი კურსი არ გაქვთ</h3>
              <Link className="btn btn-plum" href="/catalog">კურსების ნახვა</Link>
            </div>
          ) : null}

          {earned.map((c) => (
            <div className="adm-form" key={c.id}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: 6 }}>{c.title}</h2>
              <p className="lead" style={{ marginBottom: 12 }}>
                დასრულებულია — სერტიფიკატი მზადაა.
              </p>
              <p className="hint">
                PDF-ის ჩამოტვირთვა ჩაირთვება სერტიფიკატების გენერაციის მიერთების შემდეგ.
              </p>
            </div>
          ))}

          {inProgress.map((c) => {
            const p = percent(c, student.done);
            return (
              <div className="pcard" key={c.id}>
                <div>
                  <h3>{c.title}</h3>
                  <div className="meta">
                    {student.done[c.id] ?? 0} / {flatLessons(c).length} გაკვეთილი — {p}%
                  </div>
                  <div className="progress"><i style={{ width: p + "%" }} /></div>
                </div>
                <Link className="btn btn-ghost" href={`/course/${c.id}`}>გაგრძელება</Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
