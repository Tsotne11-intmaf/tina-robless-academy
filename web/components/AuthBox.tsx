"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "in" | "up" | "reset";

function Eye({ shown }: { shown: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.8 12S5.7 5.2 12 5.2 22.2 12 22.2 12 18.3 18.8 12 18.8 1.8 12 1.8 12Z" />
      <circle cx="12" cy="12" r="3.1" />
      {shown ? <path d="M3.5 3.5l17 17" /> : null}
    </svg>
  );
}

export default function AuthBox() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [mode, setMode] = useState<Mode>("in");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleOn, setGoogleOn] = useState(false);

  /* The Google button stays hidden until Supabase confirms the provider is really
     enabled. Clicking it while disabled navigates the visitor to a raw JSON error
     page, which is not something to hand a customer. */
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(url + "/auth/v1/settings", { headers: { apikey: key } })
      .then((r) => r.json())
      .then((s) => setGoogleOn(!!(s && s.external && s.external.google)))
      .catch(() => {});
  }, []);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg({ text: "მოწმდება…" });
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
    });
    setBusy(false);
    if (error) {
      setMsg({
        text:
          error.status === 400
            ? "ელფოსტა ან პაროლი არასწორია (ან ელფოსტა ჯერ არ დაგიდასტურებიათ)."
            : "შესვლა ვერ მოხერხდა: " + error.message,
        kind: "bad",
      });
      return;
    }
    setMsg(null);
    router.push(next);
    router.refresh();
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    setBusy(true);
    setMsg({ text: "იგზავნება…" });
    const { error } = await supabase.auth.signUp({
      email,
      password: String(f.get("password")),
      options: {
        data: {
          full_name: String(f.get("full_name")).trim(),
          phone: String(f.get("phone") || "").trim(),
          marketing_ok: f.get("marketing_ok") === "on",
        },
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin + next : undefined,
      },
    });
    setBusy(false);
    if (error) {
      setMsg({
        text:
          error.status === 422
            ? "ასეთი ელფოსტა უკვე რეგისტრირებულია."
            : "რეგისტრაცია ვერ მოხერხდა: " + error.message,
        kind: "bad",
      });
      return;
    }
    // Confirmation is on, so signUp returns a user but no session yet.
    setMsg({
      text: "ანგარიში შეიქმნა. დაადასტურეთ ელფოსტა — ბმული გაიგზავნა " + email + "-ზე.",
      kind: "ok",
    });
    setMode("in");
  }

  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined" ? window.location.origin + "/login" : undefined,
    });
    setBusy(false);
    /* Worded so it never reveals whether an address has an account - Supabase
       returns success either way precisely so this cannot be used to find out. */
    setMsg({
      text: "თუ ასეთი ანგარიში არსებობს, აღდგენის ბმული გაიგზავნა " + email + "-ზე.",
      kind: "ok",
    });
  }

  function passwordField(
    id: string,
    autoComplete: string,
    placeholder: string,
    minLength?: number
  ) {
    return (
      <div className="field">
        <label htmlFor={id}>პაროლი</label>
        <div className="pass-wrap">
          <input
            id={id}
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            minLength={minLength}
            required
          />
          <button
            type="button"
            className="pass-eye"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
            title={showPw ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
          >
            <Eye shown={showPw} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-box">
      <h1>ჩემი კაბინეტი</h1>

      {googleOn ? (
        <>
          <button
            type="button"
            className="btn btn-google"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin + next },
              })
            }
          >
            Google-ით გაგრძელება
          </button>
          <div className="auth-or">
            <span>ან</span>
          </div>
        </>
      ) : null}

      {mode === "in" ? (
        <>
          <p>შედით იმ ელფოსტითა და პაროლით, რომლითაც დარეგისტრირდით.</p>
          <form onSubmit={signIn}>
            <div className="field">
              <label htmlFor="lg-email">ელფოსტა</label>
              <input
                id="lg-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            {passwordField("lg-pass", "current-password", "••••••••")}
            <button className="btn btn-plum" type="submit" disabled={busy}>
              შესვლა
            </button>
          </form>
          <p className="hint">
            დაგავიწყდათ პაროლი?{" "}
            <a className="btn-link" onClick={() => { setMode("reset"); setMsg(null); }}>
              აღდგენა ელფოსტით
            </a>
          </p>
          <p className="hint">
            ჯერ არ გაქვთ ანგარიში?{" "}
            <a className="btn-link" onClick={() => { setMode("up"); setMsg(null); }}>
              რეგისტრაცია
            </a>
          </p>
        </>
      ) : null}

      {mode === "up" ? (
        <>
          <p>შექმენით ანგარიში — შემდეგ თინა დაგამატებთ შეძენილ კურსზე.</p>
          <form onSubmit={signUp}>
            <div className="field">
              <label htmlFor="su-name">სახელი და გვარი</label>
              <input id="su-name" name="full_name" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="su-email">ელფოსტა</label>
              <input
                id="su-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="su-phone">ტელეფონი (სურვილისამებრ)</label>
              <input
                id="su-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+995 5xx xxx xxx"
              />
            </div>
            {passwordField("su-pass", "new-password", "მინიმუმ 8 სიმბოლო", 8)}
            <label className="auth-check">
              <input type="checkbox" name="marketing_ok" /> მსურს სიახლეების და
              ფასდაკლებების მიღება ელფოსტით
            </label>
            <button className="btn btn-plum" type="submit" disabled={busy}>
              რეგისტრაცია
            </button>
          </form>
          <p className="hint">
            უკვე გაქვთ ანგარიში?{" "}
            <a className="btn-link" onClick={() => { setMode("in"); setMsg(null); }}>
              შესვლა
            </a>
          </p>
        </>
      ) : null}

      {mode === "reset" ? (
        <>
          <p>მიუთითეთ ელფოსტა — გამოგიგზავნით პაროლის აღდგენის ბმულს.</p>
          <form onSubmit={reset}>
            <div className="field">
              <label htmlFor="rs-email">ელფოსტა</label>
              <input id="rs-email" name="email" type="email" autoComplete="email" required />
            </div>
            <button className="btn btn-plum" type="submit" disabled={busy}>
              ბმულის გამოგზავნა
            </button>
          </form>
          <p className="hint">
            გაგახსენდათ?{" "}
            <a className="btn-link" onClick={() => { setMode("in"); setMsg(null); }}>
              შესვლა
            </a>
          </p>
        </>
      ) : null}

      {msg ? (
        <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p>
      ) : null}

      <p className="hint" style={{ fontSize: ".8rem" }}>
        გაგრძელებით ეთანხმებით <a className="btn-link" href="/terms">წესებს</a> და{" "}
        <a className="btn-link" href="/privacy">კონფიდენციალურობის პოლიტიკას</a>.
      </p>
    </div>
  );
}
