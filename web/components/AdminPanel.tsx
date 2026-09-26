"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};
type Enrollment = {
  id: number;
  profile_id: string;
  course_id: string;
  expires_at: string | null;
};
type Submission = {
  id: number;
  profile_id: string;
  course_id: string;
  task_id: string;
  note: string | null;
  photo_url: string | null;
  status: string;
  grade: string | null;
  feedback: string | null;
  created_at: string;
};
type CourseRef = { id: string; title: string };

type Tab = "students" | "homework";

export default function AdminPanel({
  profiles,
  enrollments,
  submissions,
  courses,
}: {
  profiles: Profile[];
  enrollments: Enrollment[];
  submissions: Submission[];
  courses: CourseRef[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [busy, setBusy] = useState(false);

  const nameOf = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p ? p.full_name || p.email : id.slice(0, 8);
  };
  const titleOf = (id: string) => courses.find((c) => c.id === id)?.title ?? id;

  /* Granting access is an admin-only write: the enrollments policy refuses an insert
     from anyone not in the admins table, so a student cannot enrol themselves even
     by calling the API directly. */
  async function grant(profileId: string, courseId: string, days: string) {
    if (!courseId) return;
    setBusy(true);
    setMsg({ text: "ინახება…" });
    const expires =
      days && Number(days) > 0
        ? new Date(Date.now() + Number(days) * 86400000).toISOString()
        : null;
    const { error } = await supabase
      .from("enrollments")
      .upsert(
        { profile_id: profileId, course_id: courseId, expires_at: expires },
        { onConflict: "profile_id,course_id" }
      );
    setBusy(false);
    setMsg(
      error
        ? { text: "ვერ მოხერხდა: " + error.message, kind: "bad" }
        : { text: "კურსი მიენიჭა.", kind: "ok" }
    );
    if (!error) router.refresh();
  }

  async function revoke(id: number) {
    if (!confirm("წავშალოთ წვდომა ამ კურსზე?")) return;
    setBusy(true);
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    setBusy(false);
    setMsg(
      error
        ? { text: "ვერ მოხერხდა: " + error.message, kind: "bad" }
        : { text: "წვდომა წაიშალა.", kind: "ok" }
    );
    if (!error) router.refresh();
  }

  async function grade(id: number, status: string, gradeText: string, feedback: string) {
    setBusy(true);
    const { error } = await supabase
      .from("submissions")
      .update({ status, grade: gradeText || null, feedback: feedback || null })
      .eq("id", id);
    setBusy(false);
    setMsg(
      error
        ? { text: "ვერ მოხერხდა: " + error.message, kind: "bad" }
        : { text: "შეფასება შენახულია.", kind: "ok" }
    );
    if (!error) router.refresh();
  }

  return (
    <>
      <div className="filters" style={{ marginBottom: 22 }}>
        <a className="chip" aria-pressed={tab === "students"} onClick={() => setTab("students")}>
          სტუდენტები და წვდომა ({profiles.length})
        </a>
        <a className="chip" aria-pressed={tab === "homework"} onClick={() => setTab("homework")}>
          დავალებები ({submissions.filter((s) => s.status === "sent").length} ახალი)
        </a>
      </div>

      {msg ? <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p> : null}

      {tab === "students" ? (
        profiles.length === 0 ? (
          <p className="lead">ჯერ არავინ დარეგისტრირებულა.</p>
        ) : (
          profiles.map((p) => {
            const mine = enrollments.filter((e) => e.profile_id === p.id);
            return (
              <div className="adm-form" key={p.id}>
                <div className="prof-top" style={{ marginBottom: 14 }}>
                  <div
                    className="prof-pic"
                    style={{
                      width: 56,
                      height: 56,
                      ...(p.avatar_url
                        ? { background: `url(${p.avatar_url}) center/cover` }
                        : {}),
                    }}
                  >
                    {p.avatar_url ? "" : ""}
                  </div>
                  <div>
                    <b>{p.full_name || "—"}</b>
                    <div className="mail">
                      {p.email}
                      {p.phone ? " · " + p.phone : ""}
                    </div>
                    <div className="hint">
                      დარეგისტრირდა {new Date(p.created_at).toLocaleDateString("ka-GE")}
                    </div>
                  </div>
                </div>

                {mine.length ? (
                  <div className="adm-list" style={{ marginBottom: 12 }}>
                    {mine.map((e) => (
                      <div className="adm-row" key={e.id}>
                        <div className="adm-main">
                          <b>{titleOf(e.course_id)}</b>
                          <span>
                            {e.expires_at
                              ? "წვდომა " +
                                new Date(e.expires_at).toLocaleDateString("ka-GE") +
                                "-მდე"
                              : "უვადო წვდომა"}
                          </span>
                        </div>
                        <div className="adm-btns">
                          <button className="btn btn-ghost" onClick={() => revoke(e.id)} disabled={busy}>
                            ✕ წაშლა
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="hint" style={{ marginBottom: 12 }}>კურსები არ აქვს.</p>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    grant(p.id, String(f.get("course")), String(f.get("days") || ""));
                  }}
                >
                  <div className="adm-2">
                    <div className="field">
                      <label>კურსის მინიჭება</label>
                      <select name="course" defaultValue="">
                        <option value="">— აირჩიეთ —</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>დღე (ცარიელი = უვადო)</label>
                      <input name="days" type="number" min={1} placeholder="მაგ. 45" />
                    </div>
                  </div>
                  <button className="btn btn-plum" type="submit" disabled={busy}>
                    წვდომის მიცემა
                  </button>
                </form>
              </div>
            );
          })
        )
      ) : submissions.length === 0 ? (
        <p className="lead">ჯერ არავის ჩაუბარებია დავალება.</p>
      ) : (
        submissions.map((s) => (
          <div className="adm-form" key={s.id}>
            <b>{nameOf(s.profile_id)}</b>
            <div className="mail">
              {titleOf(s.course_id)} · {s.task_id} ·{" "}
              {new Date(s.created_at).toLocaleDateString("ka-GE")}
            </div>
            {s.note ? <p className="lead">{s.note}</p> : null}
            {s.photo_url ? (
              /* plain img: file lives on UploadThing's CDN, outside next/image config */
              <img
                src={s.photo_url}
                alt="ნამუშევარი"
                style={{ maxWidth: 240, borderRadius: 12, margin: "10px 0" }}
              />
            ) : null}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                grade(
                  s.id,
                  String(f.get("status")),
                  String(f.get("grade") || ""),
                  String(f.get("feedback") || "")
                );
              }}
            >
              <div className="adm-2">
                <div className="field">
                  <label>სტატუსი</label>
                  <select name="status" defaultValue={s.status}>
                    <option value="sent">შემოწმების მოლოდინში</option>
                    <option value="done">შემოწმებულია</option>
                    <option value="redo">საჭიროა გადაკეთება</option>
                  </select>
                </div>
                <div className="field">
                  <label>შეფასება</label>
                  <input name="grade" defaultValue={s.grade ?? ""} placeholder="მაგ. 9/10" />
                </div>
              </div>
              <div className="field">
                <label>კომენტარი სტუდენტს</label>
                <textarea name="feedback" rows={2} defaultValue={s.feedback ?? ""} />
              </div>
              <button className="btn btn-plum" type="submit" disabled={busy}>
                შენახვა
              </button>
            </form>
          </div>
        ))
      )}
    </>
  );
}
