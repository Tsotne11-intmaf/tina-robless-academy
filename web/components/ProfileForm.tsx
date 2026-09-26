"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/lib/uploadthing";

type Profile = {
  full_name?: string | null;
  phone?: string | null;
  marketing_ok?: boolean | null;
  avatar_url?: string | null;
};

/* Name, phone and photo, all written to the student's own profiles row. The update
   policy is auth.uid() = id, so this physically cannot touch anyone else's record.

   No card details here, and none should be: card data is regulated under PCI-DSS and
   belongs with the payment provider, which hands back a token and a masked last four
   for display. */
export default function ProfileForm({
  email,
  profile,
}: {
  email: string;
  profile: Profile | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? null);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg({ text: "ინახება…" });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setMsg({ text: "ავტორიზაცია საჭიროა", kind: "bad" });
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(f.get("full_name")).trim(),
        phone: String(f.get("phone") || "").trim() || null,
        marketing_ok: f.get("marketing_ok") === "on",
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      setMsg({ text: "შენახვა ვერ მოხერხდა: " + error.message, kind: "bad" });
      return;
    }
    setMsg({ text: "შენახულია.", kind: "ok" });
    router.refresh();
  }

  return (
    <>
      <div className="adm-form">
        <div className="prof-top">
          <div
            className="prof-pic"
            style={avatar ? { background: `url(${avatar}) center/cover` } : undefined}
          >
            {avatar ? "" : "ფოტო"}
          </div>
          <div>
            <UploadButton
              endpoint="avatar"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.ufsUrl ?? null;
                if (url) setAvatar(url);
                setMsg({ text: "ფოტო განახლდა.", kind: "ok" });
                router.refresh();
              }}
              onUploadError={(e: Error) =>
                setMsg({ text: "ატვირთვა ვერ მოხერხდა: " + e.message, kind: "bad" })
              }
            />
            <p className="hint" style={{ marginTop: 8 }}>
              კვადრატული ფოტო გამოიყურება საუკეთესოდ. მაქსიმუმ 2 MB.
            </p>
          </div>
        </div>

        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="pf-name">სახელი და გვარი</label>
            <input
              id="pf-name"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="pf-phone">ტელეფონი</label>
            <input
              id="pf-phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              placeholder="+995 5xx xxx xxx"
            />
          </div>
          <div className="field">
            <label htmlFor="pf-email">ელფოსტა</label>
            <input id="pf-email" defaultValue={email} disabled />
          </div>
          <label className="auth-check">
            <input
              type="checkbox"
              name="marketing_ok"
              defaultChecked={!!profile?.marketing_ok}
            />{" "}
            მსურს სიახლეების მიღება ელფოსტით
          </label>
          <button className="btn btn-plum" type="submit" disabled={busy}>
            შენახვა
          </button>
        </form>

        {msg ? (
          <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p>
        ) : null}
      </div>

      <div className="adm-form">
        <h2>გადახდის ბარათი</h2>
        <p className="lead" style={{ margin: 0 }}>
          ბარათის მონაცემებს საიტი არ ინახავს — ეს კანონით დაცული ინფორმაციაა და რჩება
          გადახდის სისტემასთან. გადახდის ჩართვის შემდეგ აქ გამოჩნდება მხოლოდ ბოლო 4 ციფრი.
        </p>
      </div>
    </>
  );
}
