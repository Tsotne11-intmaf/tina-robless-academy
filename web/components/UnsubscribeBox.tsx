"use client";

import { useState } from "react";

export default function UnsubscribeBox({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "bad">("idle");

  async function confirm() {
    setState("busy");
    const r = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setState(r.ok ? "done" : "bad");
  }

  if (state === "done") {
    return (
      <div className="login-box">
        <h1>გამოწერა გაუქმებულია</h1>
        <p>
          სიახლეებსა და აქციებს აღარ გამოგიგზავნით. ანგარიში და შეძენილი კურსები
          უცვლელად რჩება.
        </p>
        <p className="hint">
          გადაიფიქრეთ? ჩართვა შეგიძლიათ <a className="btn-link" href="/profile">პროფილის</a> გვერდიდან.
        </p>
      </div>
    );
  }

  return (
    <div className="login-box">
      <h1>გამოწერის გაუქმება</h1>
      <p>
        დადასტურების შემდეგ სიახლეებსა და აქციებს აღარ მიიღებთ. ანგარიშსა და
        შეძენილ კურსებს ეს არ შეეხება.
      </p>
      <button className="btn btn-plum" onClick={confirm} disabled={state === "busy"}>
        {state === "busy" ? "მუშავდება…" : "დიახ, გამოწერის გაუქმება"}
      </button>
      {state === "bad" ? (
        <p className="auth-msg bad">ვერ მოხერხდა. სცადეთ თავიდან.</p>
      ) : null}
      <p className="hint">
        <a className="btn-link" href="/">მთავარ გვერდზე დაბრუნება</a>
      </p>
    </div>
  );
}
