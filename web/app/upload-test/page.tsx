"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/lib/uploadthing";
import type { User } from "@supabase/supabase-js";

/* A page purely to prove the chain end to end:
   sign in with Supabase -> upload through UploadThing -> the URL is written back
   onto the signed-in student's own profiles row by the server. */
export default function UploadTest() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [uploaded, setUploaded] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg("მოწმდება…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? "შეცდომა: " + error.message : "");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUploaded(null);
  }

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 620 }}>
        <h1>ატვირთვის ტესტი</h1>

        {!user ? (
          <div className="adm-form">
            <p className="lead">
              ატვირთვა მხოლოდ ავტორიზებულ მომხმარებელს შეუძლია — ეს სერვერზე მოწმდება.
            </p>
            <form onSubmit={signIn}>
              <div className="field">
                <label>ელფოსტა</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>პაროლი</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-plum" type="submit">
                შესვლა
              </button>
            </form>
            {msg && <p className="auth-msg">{msg}</p>}
          </div>
        ) : (
          <div className="adm-form">
            <p className="lead">
              შესული ხართ: <b>{user.email}</b>
            </p>

            <UploadButton
              endpoint="avatar"
              onClientUploadComplete={(res) => {
                setUploaded(res?.[0]?.ufsUrl ?? null);
                setMsg("ატვირთვა დასრულდა — ბმული ჩაიწერა პროფილში.");
              }}
              onUploadError={(e: Error) => setMsg("შეცდომა: " + e.message)}
            />

            {uploaded && (
              <div style={{ marginTop: 18 }}>
                {/* plain img: the file lives on UploadThing's CDN, outside next/image config */}
                <img
                  src={uploaded}
                  alt="ატვირთული ფოტო"
                  style={{ width: 140, height: 140, objectFit: "cover", borderRadius: "50%" }}
                />
                <p className="hint" style={{ wordBreak: "break-all" }}>{uploaded}</p>
              </div>
            )}

            {msg && <p className="auth-msg ok">{msg}</p>}

            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={signOut}>
              გასვლა
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
