"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/lib/uploadthing";
import { markBand, markText } from "@/lib/mark";
import { timeLeft, dueDate } from "@/lib/due";

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
    /* Work sent back is replaced, not sent a second time: the row already
       exists, and a trigger puts it back in the queue and clears the old mark.
       A first attempt is still an insert. */
    const existing = byTask.get(task.id);
    const work = {
      note: String(f.get("note") || "").trim() || null,
      photo_url: photo,
    };
    const { error } = existing
      ? await supabase.from("submissions").update(work).eq("id", existing.id)
      : await supabase.from("submissions").insert({
          profile_id: user.id,
          course_id: task.course,
          task_id: task.id,
          ...work,
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
            {/* When it is due, said where the task is read. A deadline Tina set
                was recorded but never shown to the person it applied to. */}
            {t.due
              ? (() => {
                  const left = timeLeft(t.due);
                  if (!left) return null;
                  return (
                    <div className="due-row">
                      <span
                        className={
                          "hw-badge " + (left.late ? "over" : left.soon ? "soon" : "ok")
                        }
                      >
                        {left.late ? "⏰" : "🕒"} {left.text}
                      </span>
                      <span className="due-when">ვადა: {dueDate(t.due)}</span>
                    </div>
                  );
                })()
              : null}
            <p className="lead" style={{ marginBottom: 10 }}>{t.task}</p>

            {sub && !(sub.status === "redo" && open) ? (
              <>
                {/* The whole verdict in one block: the state, the mark, and the
                    reason for it. The mark's colour says how it went before the
                    number is read; without a mark the box keeps the neutral green
                    of work that has simply been looked at. Tina's words sat in a
                    separate line below and were easy to miss - a student losing
                    marks should not have to hunt for why. */}
                <div
                  className={"auth-msg " + (sub.grade ? (markBand(sub.grade) ?? "ok") : "ok")}
                  style={{ marginTop: 0 }}
                >
                  <div className="hw-verdict-top">
                    <span>{STATUS[sub.status] ?? sub.status}</span>
                    {sub.grade ? <b>{markText(sub.grade)}</b> : null}
                  </div>
                  {sub.feedback ? (
                    <p className="hw-said-s">
                      <span>თინას შეფასება:</span> {sub.feedback}
                    </p>
                  ) : null}
                </div>
                {sub.photo_url ? (
                  /* plain img: the file is on UploadThing's CDN, outside next/image config */
                  <img
                    src={sub.photo_url}
                    alt="ჩემი ნამუშევარი"
                    style={{ maxWidth: 220, borderRadius: 12, marginTop: 10 }}
                  />
                ) : null}
                {/* Sent back means there is something to do about it. The page
                    used to show the verdict and nothing else, so work returned
                    for redoing could never be handed in again. */}
                {sub.status === "redo" ? (
                  <button
                    className="btn btn-plum"
                    style={{ marginTop: 14 }}
                    onClick={() => {
                      setOpenId(t.id);
                      setPhoto(sub.photo_url ?? null);
                      setMsg(null);
                    }}
                  >
                    ხელახლა ჩაბარება
                  </button>
                ) : null}
              </>
            ) : open ? (
              <form onSubmit={(e) => submit(e, t)}>
                <div className="field">
                  <label>კომენტარი (სურვილისამებრ)</label>
                  <textarea name="note" rows={3} defaultValue={sub?.note ?? ""} />
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
                    {sub ? "ხელახლა გაგზავნა" : "გაგზავნა"}
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
