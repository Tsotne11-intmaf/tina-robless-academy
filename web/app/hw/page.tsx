import { redirect } from "next/navigation";
import { getStudent, ownedCourses } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import { HOMEWORK } from "@/lib/catalog";
import StudentSidebar from "@/components/StudentSidebar";
import HomeworkPanel, { type Task, type Submission } from "@/components/HomeworkPanel";

export const metadata = { title: "დავალებები — Tina Robless Nail Academy" };

export default async function HomeworkPage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/hw");

  // Only tasks for courses this student actually owns.
  const tasks = (HOMEWORK as unknown as Task[]).filter((t) =>
    student.owned.includes(t.course)
  );

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

  /* Tasks Tina set for this student personally, shown above the course's own
     exercises because they were addressed to them. The id is prefixed so it can
     never collide with a catalogue task id when a submission is matched up. */
  const personal: Task[] = (assignRes.data ?? []).map((a) => ({
    id: "a" + a.id,
    course: a.course_id as string,
    title: a.title as string,
    task: a.task as string,
    due: a.due_at ? new Date(a.due_at as string).getTime() : undefined,
  }));

  return (
    <section className="lms">
      <div className="wrap lms-grid">
        <StudentSidebar student={student} courses={ownedCourses(student)} active="hw" />
        <div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>დავალებები</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            ატვირთეთ ნამუშევარი — თინა შეამოწმებს და დაგიბრუნებთ კომენტარს.
          </p>
          <HomeworkPanel tasks={[...personal, ...tasks]} submissions={(data ?? []) as Submission[]} />
        </div>
      </div>
    </section>
  );
}
