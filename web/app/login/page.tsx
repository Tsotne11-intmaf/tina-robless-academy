import { Suspense } from "react";
import AuthBox from "@/components/AuthBox";
import { getAuthStrings } from "@/lib/authStrings";

export async function generateMetadata() {
  const s = await getAuthStrings();
  return { title: s.title + " — Tina Robless Nail Academy" };
}

export default async function LoginPage() {
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
