"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/lib/uploadthing";

export type Task = {
  id: string;
  course: string;
  lesson?: number;
  title: string;
  task: string;
  due?: number;
};

export type Submission = {
  id: number;
  task_id: string;
  course_id: string;
  note: string | null;
  photo_url: string | null;
  status: string;
  grade: string | null;
  feedback: string | null;
  created_at: string;
};

const STATUS: Record<string, string> = {
  sent: "გადაგზავნილია — შემოწმების მოლოდინში",
  done: "შემოწმებულია",
  redo: "საჭიროა გადაკეთება",
};

export default function HomeworkPanel({
  tasks,
  submissions,
}: {
  tasks: Task[];
  submissions: Submission[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [busy, setBusy] = useState(false);

  const byTask = new Map(submissions.map((s) => [s.task_id, s]));

  async function submit(e: React.FormEvent<HTMLFormElement>, task: Task) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg({ text: "იგზავნება…" });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setMsg({ text: "ავტორიზაცია საჭიროა", kind: "bad" });
      return;
    }
    const { error } = await supabase.from("submissions").insert({
      profile_id: user.id,
      course_id: task.course,
      task_id: task.id,
      note: String(f.get("note") || "").trim() || null,
      photo_url: photo,
    });
    setBusy(false);
    if (error) {
      setMsg({ text: "ვერ გაიგზავნა: " + error.message, kind: "bad" });
      return;
    }
    setPhoto(null);
    setOpenId(null);
    setMsg({ text: "დავალება გაიგზავნა.", kind: "ok" });
    router.refresh();
  }

  if (!tasks.length) {
    return (
      <p className="lead">
        დავალებები გამოჩნდება კურსის შეძენის შემდეგ.
      </p>
    );
  }

  return (
    <>
      {tasks.map((t) => {
        const sub = byTask.get(t.id);
        const open = openId === t.id;
        return (
          <div className="adm-form" key={t.id}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: 4 }}>{t.title}</h2>
            <p className="lead" style={{ marginBottom: 10 }}>{t.task}</p>

            {sub ? (
              <>
                <p className="auth-msg ok" style={{ marginTop: 0 }}>
                  {STATUS[sub.status] ?? sub.status}
                  {sub.grade ? " · შეფასება: " + sub.grade : ""}
                </p>
                {sub.feedback ? <p className="lead">თინას კომენტარი: {sub.feedback}</p> : null}
                {sub.photo_url ? (
                  /* plain img: the file is on UploadThing's CDN, outside next/image config */
                  <img
                    src={sub.photo_url}
                    alt="ჩემი ნამუშევარი"
                    style={{ maxWidth: 220, borderRadius: 12, marginTop: 10 }}
                  />
                ) : null}
              </>
            ) : open ? (
              <form onSubmit={(e) => submit(e, t)}>
                <div className="field">
                  <label>კომენტარი (სურვილისამებრ)</label>
                  <textarea name="note" rows={3} />
                </div>
                <UploadButton
                  endpoint="homework"
                  onClientUploadComplete={(res) => {
                    setPhoto(res?.[0]?.ufsUrl ?? null);
                    setMsg({ text: "ფოტო აიტვირთა.", kind: "ok" });
                  }}
                  onUploadError={(e: Error) =>
                    setMsg({ text: "ატვირთვა ვერ მოხერხდა: " + e.message, kind: "bad" })
                  }
                />
                {photo ? (
                  <img
                    src={photo}
                    alt="ატვირთული"
                    style={{ maxWidth: 160, borderRadius: 12, margin: "10px 0" }}
                  />
                ) : null}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button className="btn btn-plum" type="submit" disabled={busy}>
                    გაგზავნა
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => { setOpenId(null); setPhoto(null); }}
                  >
                    გაუქმება
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-plum" onClick={() => { setOpenId(t.id); setMsg(null); }}>
                დავალების ჩაბარება
              </button>
            )}
          </div>
        );
      })}
      {msg ? <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p> : null}
    </>
  );
}
