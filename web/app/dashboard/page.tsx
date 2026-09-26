import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudent, ownedCourses, flatLessons, percent } from "@/lib/student";
import StudentSidebar from "@/components/StudentSidebar";

export const metadata = { title: "ჩემი კურსები — Tina Robless Nail Academy" };

export default async function DashboardPage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/dashboard");

  const mine = ownedCourses(student);
  let total = 0;
  let doneN = 0;
  for (const c of mine) {
    total += flatLessons(c).length;
    doneN += student.done[c.id] ?? 0;
  }
  const finished = mine.filter((c) => percent(c, student.done) === 100).length;

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={mine} active="dash" />
        <div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>
            <span>გამარჯობა,</span> {student.name}
          </h1>
          <p className="lead" style={{ marginBottom: 28 }}>
            გააგრძელეთ იქიდან, სადაც გაჩერდით.
          </p>

          <div className="stats">
            <div className="stat"><b>{mine.length}</b><span>კურსი კაბინეტში</span></div>
            <div className="stat"><b>{doneN} / {total}</b><span>გაკვეთილი დასრულებული</span></div>
            <div className="stat"><b>{finished}</b><span>სერტიფიკატი მიღებული</span></div>
          </div>

          {mine.length === 0 ? (
            <div className="pcard" style={{ display: "block" }}>
              <h3 style={{ marginBottom: 6 }}>ჯერ არცერთი კურსი არ გაქვთ</h3>
              <p className="lead" style={{ margin: "0 0 14px" }}>
                შეძენის შემდეგ კურსი აქ გამოჩნდება.
              </p>
              <Link className="btn btn-plum" href="/catalog">კურსების ნახვა</Link>
            </div>
          ) : (
            mine.map((c) => {
              const f = flatLessons(c);
              const n = student.done[c.id] ?? 0;
              const p = percent(c, student.done);
              const next = f[Math.min(n, f.length - 1)];
              const expiresAt = student.expires[c.id];
              return (
                <div className="pcard" key={c.id}>
                  <div>
                    <h3>{c.title}</h3>
                    <div className="meta">
                      {f.length} გაკვეთილი ·{" "}
                      {p === 100 ? "დასრულებულია" : "შემდეგი: " + (next?.t ?? "")}
                      {expiresAt
                        ? " · წვდომა " + new Date(expiresAt).toLocaleDateString("ka-GE") + "-მდე"
                        : " · უვადო წვდომა"}
                    </div>
                    <div className="progress"><i style={{ width: p + "%" }} /></div>
                  </div>
                  <Link className="btn btn-plum" href={`/course/${c.id}`}>
                    {n === 0 ? "დაწყება" : "გაგრძელება"}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
