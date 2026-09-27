import { redirect } from "next/navigation";
import { getStudent } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import { CATALOG } from "@/lib/catalog";
import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "ადმინ პანელი — Tina Robless Nail Academy" };

export default async function AdminPage() {
  const student = await getStudent();
  if (!student) redirect("/login?next=/admin");

  /* Admin status is read through is_admin(), which looks inside a table no client
     can touch, so the right can only be granted from the Supabase dashboard. There
     is no password here to leak: the old tina2026 string sat in the public page
     source and protected nothing once real data existed. */
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
  const [profilesRes, enrollmentsRes, submissionsRes, mailRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("enrollments").select("*"),
    supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    supabase.from("email_log").select("*").order("sent_at", { ascending: false }).limit(40),
  ]);

  const profiles = profilesRes.data ?? [];
  // Who a course announcement would actually reach, shown before it is sent.
  const subscriberCount = profiles.filter((p) => p.marketing_ok).length;

  return (
    <section className="lms">
      <div className="wrap">
        <h1 style={{ fontSize: "2.2rem", marginBottom: 6 }}>ადმინ პანელი</h1>
        <p className="lead" style={{ marginBottom: 24 }}>
          შესული ხართ როგორც {student.email}
        </p>
        <AdminPanel
          profiles={profiles}
          enrollments={enrollmentsRes.data ?? []}
          submissions={submissionsRes.data ?? []}
          courses={CATALOG.map((c) => ({ id: c.id, title: c.title }))}
          emailLog={mailRes.data ?? []}
          subscriberCount={subscriberCount}
        />
      </div>
    </section>
  );
}
