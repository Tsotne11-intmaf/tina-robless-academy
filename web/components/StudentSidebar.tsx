import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import type { Student, StudentCourse } from "@/lib/student";

/* Only courses the student owns appear here. The legacy sidebar listed every course
   in COURSES regardless, which is how an account that had bought nothing still saw
   the whole catalogue sitting in its cabinet. */
export default function StudentSidebar({
  student,
  courses,
  active,
  waiting = 0,
}: {
  student: Student;
  courses: StudentCourse[];
  active: string;
  /* Homework not handed in, or handed back to redo. Shown as a count beside the
     link, because a task set on Monday was otherwise only discovered by opening
     the page on the off-chance. */
  waiting?: number;
}) {
  const avatar = student.profile?.avatar_url as string | undefined;
  return (
    <aside className="side">
      {avatar ? (
        <div
          className="prof-pic"
          style={{
            width: 64,
            height: 64,
            marginBottom: 10,
            background: `url(${avatar}) center/cover`,
          }}
        />
      ) : null}
      <div className="who">{student.name}</div>
      <div className="mail">{student.email}</div>
      <nav>
        <Link href="/profile" aria-current={active === "profile" ? "page" : undefined}>
          ჩემი პროფილი
        </Link>
        <Link href="/dashboard" aria-current={active === "dash" ? "page" : undefined}>
          ჩემი კურსები
        </Link>
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/course/${c.id}`}
            aria-current={active === c.id ? "page" : undefined}
          >
            {c.title}
          </Link>
        ))}
        <Link href="/hw" aria-current={active === "hw" ? "page" : undefined}>
          დავალებები
          {waiting > 0 ? (
            <i className="hw-count hot" title={`${waiting} გასაკეთებელი დავალება`}>
              {waiting}
            </i>
          ) : null}
        </Link>
        <Link href="/mycert" aria-current={active === "cert" ? "page" : undefined}>
          ჩემი სერტიფიკატები
        </Link>
        {student.isAdmin ? (
          <Link href="/admin" aria-current={active === "admin" ? "page" : undefined}>
            ადმინ პანელი
          </Link>
        ) : null}
        <SignOutButton />
      </nav>
    </aside>
  );
}
