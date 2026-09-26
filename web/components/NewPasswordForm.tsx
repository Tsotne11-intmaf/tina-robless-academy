"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthStrings } from "@/lib/authStrings";
import PasswordField from "@/components/PasswordField";

/* Reached only through a recovery link, which the callback route has already turned
   into a real session. updateUser therefore changes the password of whoever holds
   that session and nobody else - there is no user id to tamper with here. */
export default function NewPasswordForm({ s }: { s: AuthStrings }) {
  const supabase = createClient();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("password"));
    if (pw !== String(f.get("password2"))) {
      setMsg({ text: s.pwMismatch, kind: "bad" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setMsg({ text: s.pwUpdateFailed + error.message, kind: "bad" });
      return;
    }
    setMsg({ text: s.pwUpdated, kind: "ok" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-box">
      <h1>{s.newPwTitle}</h1>
      <p>{s.newPwIntro}</p>
      <form onSubmit={save}>
        <PasswordField
          id="np-pass"
          label={s.newPw}
          autoComplete="new-password"
          placeholder={s.pwMin}
          minLength={8}
          shown={showPw}
          onToggle={() => setShowPw((v) => !v)}
          showLabel={s.showPw}
          hideLabel={s.hidePw}
        />
        <PasswordField
          id="np-pass2"
          name="password2"
          label={s.repeatPw}
          autoComplete="new-password"
          placeholder={s.pwMin}
          minLength={8}
          shown={showPw}
          onToggle={() => setShowPw((v) => !v)}
          showLabel={s.showPw}
          hideLabel={s.hidePw}
        />
        <button className="btn btn-plum" type="submit" disabled={busy}>
          {s.savePw}
        </button>
      </form>
      {msg ? (
        <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p>
      ) : null}
    </div>
  );
}
