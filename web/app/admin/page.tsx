import { redirect } from "next/navigation";
import { getStudent } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import { CATALOG } from "@/lib/catalog";
import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "ადმინ პანელი — Tina Robless Nail Academy" };

export default async function AdminPage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/admin");

  /* Admin status comes from the admins table, which has no client policy at all, so
     it cannot be read or written from the browser and can only be granted from the
     Supabase dashboard. There is no password here to leak: the old tina2026 string
     sat in the public page source and protected nothing once real data existed. */
  if (!student.isAdmin) {
    return (
      <section className="lms">
        <div className="wrap" style={{ maxWidth: 620 }}>
          <h1>ადმინ პანელი</h1>
          <p className="lead">
            ამ გვერდზე წვდომა არ გაქვთ. ადმინის უფლება ენიჭება მონაცემთა ბაზიდან.
          </p>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  // RLS returns every row here only because the caller is a listed admin.
  const [profilesRes, enrollmentsRes, submissionsRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("enrollments").select("*"),
    supabase.from("submissions").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <section className="lms">
      <div className="wrap">
        <h1 style={{ fontSize: "2.2rem", marginBottom: 6 }}>ადმინ პანელი</h1>
        <p className="lead" style={{ marginBottom: 24 }}>
          შესული ხართ როგორც {student.email}
        </p>
        <AdminPanel
          profiles={profilesRes.data ?? []}
          enrollments={enrollmentsRes.data ?? []}
          submissions={submissionsRes.data ?? []}
          courses={CATALOG.map((c) => ({ id: c.id, title: c.title }))}
        />
      </div>
    </section>
  );
}
