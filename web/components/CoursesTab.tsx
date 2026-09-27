"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export type AdminCourse = {
  id: string;
  cat: string;
  title: string;
  dur: string;
  price: string;
  was?: string;
  desc: string;
  photo?: string | null;
  video?: string | null;
  badge?: string | null;
  featured?: boolean;
  order?: number;
  inCode: boolean;
};

const CATS: Record<string, string> = {
  package: "პაკეტები",
  program: "პროგრამები",
  technique: "ტექნიკა",
  art: "დიზაინი",
  business: "ბიზნესი",
};

const BADGES: Record<string, string> = {
  "": "— არცერთი —",
  package: "პაკეტი",
  premium: "პრემიუმ",
  sale: "ფასდაკლება",
};

/* The catalogue, as something the owner can actually work with.

   Adding a course and deciding where it shows are the same job, so the front
   page placement is a checkbox on the course rather than a separate screen to
   remember. */
export default function CoursesTab({ courses }: { courses: AdminCourse[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  async function save(body: Record<string, unknown>) {
    setBusy(true);
    setMsg({ text: "ინახება…" });
    const r = await fetch("/api/admin/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setMsg({ text: "ვერ შეინახა: " + (out.error ?? r.status), kind: "bad" });
      return;
    }
    setMsg({ text: out.created ? "კურსი დაემატა." : "შენახულია.", kind: "ok" });
    setEditing(null);
    setAdding(false);
    setPhoto(null);
    router.refresh();
  }

  function form(c: AdminCourse | null) {
    const isNew = c === null;
    return (
      <form
        className="adm-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          save({
            id: isNew ? String(f.get("id")) : c!.id,
            cat: String(f.get("cat")),
            title: String(f.get("title")),
            dur: String(f.get("dur")),
            price: String(f.get("price")),
            was: String(f.get("was") || ""),
            descr: String(f.get("descr")),
            video: String(f.get("video") || ""),
            badge: String(f.get("badge") || ""),
            photo: photo ?? (isNew ? "" : c!.photo ?? ""),
            featured: f.get("featured") === "on",
            sort: f.get("sort") ? Number(f.get("sort")) : null,
          });
        }}
      >
        <h2 style={{ marginBottom: 14 }}>
          {isNew ? "ახალი კურსი" : "კურსის რედაქტირება"}
        </h2>

        {isNew ? (
          <div className="field">
            <label>მისამართი (ლათინურად, მაგ. french-pro)</label>
            <input name="id" placeholder="french-pro" required />
          </div>
        ) : null}

        <div className="adm-2">
          <div className="field">
            <label>სახელი</label>
            <input name="title" defaultValue={c?.title ?? ""} required />
          </div>
          <div className="field">
            <label>კატეგორია</label>
            <select name="cat" defaultValue={c?.cat ?? "technique"}>
              {Object.entries(CATS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>აღწერა</label>
          <textarea name="descr" rows={3} defaultValue={c?.desc ?? ""} required />
        </div>

        <div className="adm-2">
          <div className="field">
            <label>ფასი</label>
            <input name="price" defaultValue={c?.price ?? ""} placeholder="590 ₾" required />
          </div>
          <div className="field">
            <label>ძველი ფასი (ფასდაკლებისთვის)</label>
            <input name="was" defaultValue={c?.was ?? ""} placeholder="750 ₾" />
          </div>
        </div>

        <div className="adm-2">
          <div className="field">
            <label>ხანგრძლივობა</label>
            <input name="dur" defaultValue={c?.dur ?? ""} placeholder="მინ. 5 დღე · 22 გაკვეთილი" />
          </div>
          <div className="field">
            <label>ნიშანი</label>
            <select name="badge" defaultValue={c?.badge ?? ""}>
              {Object.entries(BADGES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>ვიდეოს ბმული</label>
          <input
            name="video"
            defaultValue={c?.video ?? ""}
            placeholder="https://… (YouTube, Vimeo ან სხვა)"
          />
          <p className="hint" style={{ textAlign: "left", marginTop: 4 }}>
            ვიდეო ინახება იმ სერვისზე, საიდანაც ბმულია. აქ მხოლოდ მისამართი ეწერება.
          </p>
        </div>

        <div className="field">
          <label>ფოტო</label>
          {(photo ?? c?.photo) ? (
            <div
              className="thumb"
              style={{
                height: 140,
                borderRadius: 12,
                marginBottom: 8,
                background: `url(${photo ?? c?.photo}) center/cover`,
              }}
            />
          ) : null}
          <UploadButton
            endpoint="avatar"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) setPhoto(url);
            }}
            onUploadError={(e: Error) =>
              setMsg({ text: "ფოტო ვერ აიტვირთა: " + e.message, kind: "bad" })
            }
          />
        </div>

        <div className="adm-2">
          <div className="field">
            <label>რიგითობა (ცარიელი = ავტომატური)</label>
            <input name="sort" type="number" defaultValue={c?.order ?? ""} />
          </div>
          <div className="field" style={{ alignSelf: "end" }}>
            <label className="auth-check">
              <input type="checkbox" name="featured" defaultChecked={!!c?.featured} /> მთავარ
              გვერდზე ჩვენება
            </label>
          </div>
        </div>

        <div className="stu-give-btns">
          <button className="btn btn-plum" type="submit" disabled={busy}>
            {isNew ? "დამატება" : "შენახვა"}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setEditing(null);
              setAdding(false);
              setPhoto(null);
            }}
          >
            გაუქმება
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      {msg ? <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p> : null}

      {adding ? (
        form(null)
      ) : (
        <button
          className="btn btn-plum stu-add"
          style={{ marginBottom: 18 }}
          onClick={() => {
            setAdding(true);
            setEditing(null);
            setPhoto(null);
          }}
        >
          + ახალი კურსის დამატება
        </button>
      )}

      {courses.map((c) =>
        editing === c.id ? (
          <div key={c.id}>{form(c)}</div>
        ) : (
          <div className="stu-card" key={c.id}>
            <div className="stu-head">
              <div
                className="stu-pic"
                style={
                  c.photo ? { background: `url(${c.photo}) center/cover` } : undefined
                }
              >
                {c.photo ? "" : c.title.trim().charAt(0)}
              </div>
              <div className="stu-who">
                <b>{c.title}</b>
                <span>
                  {CATS[c.cat] ?? c.cat} · {c.price}
                  {c.dur ? " · " + c.dur : ""}
                </span>
                <span>
                  {c.featured ? "★ მთავარ გვერდზე" : "მთავარზე არ ჩანს"}
                  {c.video ? " · ვიდეო მიბმულია" : ""}
                  {c.inCode ? "" : " · დამატებულია პანელიდან"}
                </span>
              </div>
            </div>
            <div className="stu-give-btns" style={{ marginTop: 14 }}>
              <button
                className="btn btn-plum stu-add"
                onClick={() => {
                  setEditing(c.id);
                  setAdding(false);
                  setPhoto(null);
                }}
                disabled={busy}
              >
                რედაქტირება
              </button>
              <button
                className="btn btn-ghost stu-add"
                disabled={busy}
                onClick={() => {
                  if (!confirm(`დავმალოთ „${c.title}"? საიტზე აღარ გამოჩნდება.`)) return;
                  save({ id: c.id, hidden: true });
                }}
              >
                დამალვა
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
}
