import { Suspense } from "react";
import AuthBox from "@/components/AuthBox";

export const metadata = { title: "ჩემი კაბინეტი — Tina Robless Nail Academy" };

export default function LoginPage() {
  return (
    <section className="lms">
      <div className="wrap">
        <Suspense fallback={<div className="login-box"><p className="lead">იტვირთება…</p></div>}>
          <AuthBox />
        </Suspense>
      </div>
    </section>
  );
}
