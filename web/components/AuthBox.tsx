"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthStrings } from "@/lib/authStrings";
import PasswordField from "@/components/PasswordField";

type Mode = "in" | "up" | "reset";

/* Every string arrives already translated from the server page.

   The panel cannot translate itself: the dictionary is 180 KB and belongs nowhere
   near the browser bundle, and reading the language cookie client-side would render
   Georgian first and flip afterwards. The server knows the language before the first
   byte goes out, so it resolves the strings and passes them down. */
export default function AuthBox({ s }: { s: AuthStrings }) {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const linkFailed = params.get("authError") === "1";

  const [mode, setMode] = useState<Mode>("in");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(
    linkFailed ? { text: s.linkBad, kind: "bad" } : null
  );
  const [busy, setBusy] = useState(false);
  const [googleOn, setGoogleOn] = useState(false);

  /* Email links carry a one-time code that only the server can exchange, so they all
     point at /auth/callback and it forwards to the real destination afterwards. */
  const callback = (to: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`
      : undefined;

  /* The Google button stays hidden until Supabase confirms the provider is really
     enabled. Clicking it while disabled navigates the visitor to a raw JSON error
     page, which is not something to hand a customer. */
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(url + "/auth/v1/settings", { headers: { apikey: key } })
      .then((r) => r.json())
      .then((x) => setGoogleOn(!!(x && x.external && x.external.google)))
      .catch(() => {});
  }, []);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg({ text: s.checking });
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
    });
    setBusy(false);
    if (error) {
      setMsg({
        text: error.status === 400 ? s.badCreds : s.signInFailed + error.message,
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
    setMsg({ text: s.sending });
    const { error } = await supabase.auth.signUp({
      email,
      password: String(f.get("password")),
      options: {
        data: {
          full_name: String(f.get("full_name")).trim(),
          phone: String(f.get("phone") || "").trim(),
          marketing_ok: f.get("marketing_ok") === "on",
        },
        emailRedirectTo: callback(next),
      },
    });
    setBusy(false);
    if (error) {
      setMsg({
        text: error.status === 422 ? s.emailTaken : s.signUpFailed + error.message,
        kind: "bad",
      });
      return;
    }
    // Confirmation is on, so signUp returns a user but no session yet.
    setMsg({ text: s.accountCreated.replace("{email}", email), kind: "ok" });
    setMode("in");
  }

  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    setBusy(true);
    setMsg({ text: s.sending });
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callback("/reset-password"),
    });
    setBusy(false);
    /* Worded so it never reveals whether an address has an account - Supabase
       returns success either way precisely so this cannot be used to find out. */
    setMsg({ text: s.resetSent.replace("{email}", email), kind: "ok" });
  }

  const pw = (id: string, autoComplete: string, placeholder: string, minLength?: number) => (
    <PasswordField
      id={id}
      label={s.password}
      autoComplete={autoComplete}
      placeholder={placeholder}
      minLength={minLength}
      shown={showPw}
      onToggle={() => setShowPw((v) => !v)}
      showLabel={s.showPw}
      hideLabel={s.hidePw}
    />
  );

  return (
    <div className="login-box">
      <h1>{s.title}</h1>

      {googleOn ? (
        <>
          <button
            type="button"
            className="btn btn-google"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: callback(next) },
              })
            }
          >
            {s.googleBtn}
          </button>
          <div className="auth-or">
            <span>{s.or}</span>
          </div>
        </>
      ) : null}

      {mode === "in" ? (
        <>
          <p>{s.signInIntro}</p>
          <form onSubmit={signIn}>
            <div className="field">
              <label htmlFor="lg-email">{s.email}</label>
              <input
                id="lg-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            {pw("lg-pass", "current-password", "••••••••")}
            <button className="btn btn-plum" type="submit" disabled={busy}>
              {s.signIn}
            </button>
          </form>
          <p className="hint">
            {s.forgot}{" "}
            <a className="btn-link" onClick={() => { setMode("reset"); setMsg(null); }}>
              {s.forgotLink}
            </a>
          </p>
          <p className="hint">
            {s.noAccount}{" "}
            <a className="btn-link" onClick={() => { setMode("up"); setMsg(null); }}>
              {s.register}
            </a>
          </p>
        </>
      ) : null}

      {mode === "up" ? (
        <>
          <p>{s.signUpIntro}</p>
          <form onSubmit={signUp}>
            <div className="field">
              <label htmlFor="su-name">{s.fullName}</label>
              <input id="su-name" name="full_name" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="su-email">{s.email}</label>
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
              <label htmlFor="su-phone">{s.phoneOpt}</label>
              <input
                id="su-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+995 5xx xxx xxx"
              />
            </div>
            {pw("su-pass", "new-password", s.pwMin, 8)}
            <label className="auth-check">
              <input type="checkbox" name="marketing_ok" /> {s.marketing}
            </label>
            <button className="btn btn-plum" type="submit" disabled={busy}>
              {s.register}
            </button>
          </form>
          <p className="hint">
            {s.haveAccount}{" "}
            <a className="btn-link" onClick={() => { setMode("in"); setMsg(null); }}>
              {s.signIn}
            </a>
          </p>
        </>
      ) : null}

      {mode === "reset" ? (
        <>
          <p>{s.resetIntro}</p>
          <form onSubmit={reset}>
            <div className="field">
              <label htmlFor="rs-email">{s.email}</label>
              <input id="rs-email" name="email" type="email" autoComplete="email" required />
            </div>
            <button className="btn btn-plum" type="submit" disabled={busy}>
              {s.sendLink}
            </button>
          </form>
          <p className="hint">
            {s.remembered}{" "}
            <a className="btn-link" onClick={() => { setMode("in"); setMsg(null); }}>
              {s.signIn}
            </a>
          </p>
        </>
      ) : null}

      {msg ? (
        <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p>
      ) : null}

      <p className="hint" style={{ fontSize: ".8rem" }}>
        {s.termsPre} <a className="btn-link" href="/terms">{s.termsLink}</a> {s.and}{" "}
        <a className="btn-link" href="/privacy">{s.privacyLink}</a>.
      </p>
    </div>
  );
}

/* The same guard the callback applies, for the same reason: ?next= arrives from the
   URL bar and must not be able to send anyone off-site. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
