import { redirect } from "next/navigation";
import { getStudent, ownedCourses } from "@/lib/student";
import StudentSidebar from "@/components/StudentSidebar";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "ჩემი პროფილი — Tina Robless Nail Academy" };

export default async function ProfilePage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/profile");

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={ownedCourses(student)} active="profile" />
        <div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>ჩემი პროფილი</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            ეს ინფორმაცია ჩანს თინასთან, რომ დავალებების შემოწმებისას გიცნობდეთ.
          </p>
          <ProfileForm email={student.email} profile={student.profile as never} />
        </div>
      </div>
    </section>
  );
}
