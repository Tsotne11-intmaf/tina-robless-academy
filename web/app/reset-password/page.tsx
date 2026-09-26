import { redirect } from "next/navigation";
import NewPasswordForm from "@/components/NewPasswordForm";
import { getAuthStrings } from "@/lib/authStrings";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const s = await getAuthStrings();
  return { title: s.newPwTitle + " — Tina Robless Nail Academy" };
}

/* Only reachable with the session the recovery link created. Anyone arriving without
   one is sent back to the login panel with the expired-link notice rather than shown
   a password form that could not work. */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?authError=1");

  const s = await getAuthStrings();
  return (
    <section className="lms">
      <div className="wrap">
        <NewPasswordForm s={s} />
      </div>
    </section>
  );
}
