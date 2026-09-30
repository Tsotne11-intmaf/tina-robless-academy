import { redirect } from "next/navigation";
import { getStudent, ownedCourses } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import StudentSidebar from "@/components/StudentSidebar";
import HomeworkPanel, { type Task, type Submission } from "@/components/HomeworkPanel";
import { waitingHomework } from "@/lib/homework";

export const metadata = { title: "დავალებები — Tina Robless Nail Academy" };

export default async function HomeworkPage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/hw");

  const supabase = await createClient();
  // The select policy already limits both of these to the caller's own rows.
  const [subRes, assignRes] = await Promise.all([
    supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    supabase
      .from("assignments")
      .select("id,course_id,title,task,due_at")
      .order("created_at", { ascending: false }),
  ]);
  const data = subRes.data;

  /* Homework is what Tina has actually set, and nothing else.

     The catalogue used to carry four exercises of its own, attached to a course
     rather than to a person, so buying a course meant opening the cabinet to
     three pieces of homework already overdue that nobody had asked for. The id
     is prefixed so a submission can never be matched to the wrong task. */
  const personal: Task[] = (assignRes.data ?? []).map((a) => ({
    id: "a" + a.id,
    course: a.course_id as string,
    title: a.title as string,
    task: a.task as string,
    due: a.due_at ? new Date(a.due_at as string).getTime() : undefined,
  }));

  const waiting = (await waitingHomework(student)).count;

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={ownedCourses(student)} active="hw" waiting={waiting} />
        <div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>დავალებები</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            ატვირთეთ ნამუშევარი — თინა შეამოწმებს და დაგიბრუნებთ კომენტარს.
          </p>
          <HomeworkPanel tasks={personal} submissions={(data ?? []) as Submission[]} />
        </div>
      </div>
    </section>
  );
}
