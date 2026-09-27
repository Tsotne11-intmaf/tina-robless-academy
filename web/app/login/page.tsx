import { Suspense } from "react";
import AuthBox from "@/components/AuthBox";
import { getAuthStrings } from "@/lib/authStrings";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const s = await getAuthStrings();
  return { title: s.title + " — Tina Robless Nail Academy" };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  /* Anyone already signed in is sent straight to their cabinet.

     The header used to link here unconditionally, so a signed-in student who
     pressed "my account" was handed the sign-in form every single time and
     reasonably concluded they had been logged out. The header now points at the
     cabinet, and this guard covers the bookmark and the back button too. */
  const { next } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(safeNext(next));

  const s = await getAuthStrings();
  return (
    <section className="lms">
      <div className="wrap">
        <Suspense
          fallback={
            <div className="login-box">
              <p className="lead">{s.loading}</p>
            </div>
          }
        >
          <AuthBox s={s} />
        </Suspense>
      </div>
    </section>
  );
}

function safeNext(value?: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  // Never bounce back here; that would be a loop for a signed-in visitor.
  return value.startsWith("/login") ? "/dashboard" : value;
}
