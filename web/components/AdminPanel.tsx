"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CoursesTab, { type AdminCourse } from "@/components/CoursesTab";
import { markBand, markText } from "@/lib/mark";

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

type Tab = "students" | "homework" | "mail" | "courses";
type EmailLogRow = { id: number; user_id: string; kind: string; ref: string; sent_at: string };
type Assignment = {
  id: number;
  profile_id: string;
  course_id: string;
  title: string;
  task: string;
  due_at: string | null;
  created_at: string;
};

export default function AdminPanel({
  profiles,
  enrollments,
  submissions,
  courses,
  emailLog,
  subscriberCount,
  catalog,
  assignments,
}: {
  profiles: Profile[];
  enrollments: Enrollment[];
  submissions: Submission[];
  courses: CourseRef[];
  emailLog: EmailLogRow[];
  subscriberCount: number;
  catalog: AdminCourse[];
  assignments: Assignment[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  /* One grant form open at a time. Showing one under every student turned this
     screen into a wall of dropdowns, which is the opposite of what it is for. */
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [only, setOnly] = useState<"all" | "owners">("all");
  /* Which pile of homework is on screen. It opens on the one that needs Tina:
     work that has been handed in and not yet looked at. */
  const [hwPile, setHwPile] = useState<"sent" | "redo" | "done">("sent");

  const nameOf = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p ? p.full_name || p.email : id.slice(0, 8);
  };
  const titleOf = (id: string) => courses.find((c) => c.id === id)?.title ?? id;

  /* How long the student has, in the words someone would use out loud. A
     deadline that has passed is the thing Tina needs to see first, so it says
     so rather than counting negative days. */
  const timeLeft = (due: string | null) => {
    if (!due) return { text: "ვადის გარეშე", late: false };
    const ms = new Date(due).getTime() - Date.now();
    const days = Math.ceil(ms / 86400000);
    if (ms < 0) return { text: `ვადა გავიდა (${Math.abs(days)} დღის წინ)`, late: true };
    if (days <= 1) return { text: "დარჩა ბოლო დღე", late: false };
    return { text: `დარჩა ${days} დღე`, late: false };
  };

  /* A personal assignment appears in the student's cabinet with its row id
     prefixed, and that is the id their submission carries back. */
  const handedIn = (a: Assignment) =>
    submissions.find((s) => s.profile_id === a.profile_id && s.task_id === "a" + a.id);

  const ownedCount = (id: string) => enrollments.filter((e) => e.profile_id === id).length;

  const needle = query.trim().toLowerCase();
  /* Students who bought something come first, because they are the ones with
     work to mark and access to manage; the rest are still reachable but are not
     what this screen is usually opened for. Search and filter apply before the
     ordering so the two never fight each other. */
  const shown = profiles
    .filter(
      (p) =>
        (!needle ||
          (p.full_name ?? "").toLowerCase().includes(needle) ||
          p.email.toLowerCase().includes(needle)) &&
        (only === "all" || ownedCount(p.id) > 0)
    )
    .sort((a, b) => ownedCount(b.id) - ownedCount(a.id));

  const ownerTotal = profiles.filter((p) => ownedCount(p.id) > 0).length;

  /* Every submission is in exactly one of these three states, so the three
     piles together are the whole list - nothing is hidden by filtering. */
  const hwCount = (k: string) => submissions.filter((s) => s.status === k).length;
  const hwShown = submissions.filter((s) => s.status === hwPile);

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
    const { data, error } = await supabase
      .from("enrollments")
      .upsert(
        { profile_id: profileId, course_id: courseId, expires_at: expires },
        { onConflict: "profile_id,course_id" }
      )
      .select("id")
      .maybeSingle();
    if (error) {
      setBusy(false);
      setMsg({ text: "ვერ მოხერხდა: " + error.message, kind: "bad" });
      return;
    }
    // The student is told, rather than being left to notice on their next visit.
    const mail = await notifyStudent({
      kind: "granted",
      userId: profileId,
      courseId,
      ref: String(data?.id ?? courseId),
    });
    setBusy(false);
    setMsg({ text: "კურსი მიენიჭა" + mail, kind: "ok" });
    router.refresh();
  }

  /* Best effort, and deliberately so: the access itself is already saved, so a
     mail problem must report itself without making the grant look failed. */
  async function notifyStudent(payload: Record<string, string>) {
    try {
      const r = await fetch("/api/admin/notify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) return " (წერილი ვერ გაიგზავნა)";
      return body.sent ? " და ელფოსტა გაიგზავნა." : ".";
    } catch {
      return " (წერილი ვერ გაიგზავნა)";
    }
  }

  async function assign(profileId: string, f: FormData) {
    setBusy(true);
    setMsg({ text: "იგზავნება…" });
    const r = await fetch("/api/admin/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: profileId,
        courseId: String(f.get("course")),
        title: String(f.get("title") || "").trim(),
        task: String(f.get("task") || "").trim(),
        due: String(f.get("due") || ""),
      }),
    });
    const body = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setMsg({ text: "ვერ მოხერხდა: " + (body.error ?? r.status), kind: "bad" });
      return;
    }
    setMsg({
      text: body.sent
        ? "დავალება მიეცა და ელფოსტა გაიგზავნა."
        : "დავალება მიეცა (წერილი ვერ გაიგზავნა).",
      kind: body.sent ? "ok" : "bad",
    });
    setAssignFor(null);
    router.refresh();
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

  async function grade(
    id: number,
    profileId: string,
    courseId: string,
    status: string,
    gradeText: string,
    feedback: string
  ) {
    setBusy(true);
    const { error } = await supabase
      .from("submissions")
      .update({ status, grade: gradeText || null, feedback: feedback || null })
      .eq("id", id);
    if (error) {
      setBusy(false);
      setMsg({ text: "ვერ მოხერხდა: " + error.message, kind: "bad" });
      return;
    }
    /* Only a finished verdict is worth an email. Parking something back in the
       queue is bookkeeping, not news, and the reference carries the verdict so
       re-saving the same result does not write again. */
    let mail = ".";
    if (status === "done" || status === "redo") {
      mail = await notifyStudent({
        kind: "graded",
        userId: profileId,
        courseId,
        ref: `${id}:${status}`,
        // Tina's comment travels with the notice, so the student reads it in
        // the email rather than having to come and look for it.
        note: feedback,
      });
    }
    setBusy(false);
    setMsg({ text: "შეფასება შენახულია" + mail, kind: "ok" });
    /* Follow the work into the pile it just moved to. Grading something out of
       the list it is being read from would otherwise make it vanish. */
    if (status === "done" || status === "redo") setHwPile(status);
    router.refresh();
  }

  /* Undoing a verdict rather than replacing it: the mark and the comment go and
     the work returns to the queue. Nobody is mailed - a withdrawn result is not
     news the student can act on, and the next real verdict will write. */
  async function clearVerdict(id: number) {
    if (!confirm("შეფასება და კომენტარი წაიშლება, დავალება შესამოწმებელში დაბრუნდება. გავაგრძელოთ?")) return;
    setBusy(true);
    const { error } = await supabase
      .from("submissions")
      .update({ status: "sent", grade: null, feedback: null })
      .eq("id", id);
    setBusy(false);
    setMsg(
      error
        ? { text: "ვერ მოხერხდა: " + error.message, kind: "bad" }
        : { text: "შეფასება წაიშალა, დავალება შესამოწმებელშია.", kind: "ok" }
    );
    if (!error) {
      setHwPile("sent");
      router.refresh();
    }
  }

  /* Announcing a course. The server decides who is eligible and records what it
     sent, so pressing this twice for the same course mails nobody a second time. */
  async function notifyCourse(courseId: string) {
    if (!courseId) return;
    setBusy(true);
    setMsg({ text: "იგზავნება…" });
    const r = await fetch("/api/admin/notify-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const body = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setMsg({ text: "ვერ გაიგზავნა: " + (body.error ?? r.status), kind: "bad" });
      return;
    }
    setMsg({
      text: body.sent ? `გაიგზავნა ${body.sent} მისამართზე.` : (body.note ?? "ახალი მიმღები არ იყო."),
      kind: "ok",
    });
    router.refresh();
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
        <a className="chip" aria-pressed={tab === "courses"} onClick={() => setTab("courses")}>
          კურსები ({catalog.length})
        </a>
        <a className="chip" aria-pressed={tab === "mail"} onClick={() => setTab("mail")}>
          შეტყობინებები
        </a>
      </div>

      {msg ? <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p> : null}

      {tab === "students" ? (
        <>
          <div className="filters" style={{ marginBottom: 14 }}>
            <a className="chip" aria-pressed={only === "all"} onClick={() => setOnly("all")}>
              ყველა ({profiles.length})
            </a>
            <a
              className="chip"
              aria-pressed={only === "owners"}
              onClick={() => setOnly("owners")}
            >
              კურსშეძენილები ({ownerTotal})
            </a>
          </div>

          <div className="field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label htmlFor="adm-search">სტუდენტის ძებნა</label>
            <input
              id="adm-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="სახელი ან ელფოსტა"
            />
          </div>

          {shown.length === 0 ? (
            <p className="lead">
              {profiles.length === 0
                ? "ჯერ არავინ დარეგისტრირებულა."
                : "ასეთი სტუდენტი არ მოიძებნა."}
            </p>
          ) : (
            shown.map((p) => {
              const mine = enrollments.filter((e) => e.profile_id === p.id);
              const mineTasks = assignments.filter((a) => a.profile_id === p.id);
              const open = openFor === p.id;
              return (
                <div className="stu-card" key={p.id}>
                  <div className="stu-head">
                    <div
                      className="stu-pic"
                      style={
                        p.avatar_url
                          ? { background: `url(${p.avatar_url}) center/cover` }
                          : undefined
                      }
                    >
                      {p.avatar_url
                        ? ""
                        : (p.full_name || p.email).trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="stu-who">
                      <b>{p.full_name || "უსახელო"}</b>
                      <span>{p.email}</span>
                      {p.phone ? <span>{p.phone}</span> : null}
                    </div>
                  </div>

                  <div className="stu-courses">
                    <div className="stu-label">
                      შეძენილი კურსები{mine.length ? ` (${mine.length})` : ""}
                    </div>
                    {mine.length ? (
                      mine.map((e) => {
                        const gone = !!e.expires_at && new Date(e.expires_at) < new Date();
                        return (
                          <div className={"stu-pill" + (gone ? " out" : "")} key={e.id}>
                            <span className="stu-pill-name">{titleOf(e.course_id)}</span>
                            <span className="stu-pill-when">
                              {e.expires_at
                                ? (gone ? "ვადა ამოიწურა " : "ვადა ") +
                                  new Date(e.expires_at).toLocaleDateString("ka-GE")
                                : "უვადოდ"}
                            </span>
                            <button
                              className="stu-x"
                              onClick={() => revoke(e.id)}
                              disabled={busy}
                              title="წვდომის მოხსნა"
                              aria-label="წვდომის მოხსნა"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="stu-none">ჯერ არცერთი კურსი არ აქვს</p>
                    )}
                  </div>

                  {/* What Tina set this student, and whether it has come back.
                      Without this the panel could hand out homework and then
                      show no trace that it had. */}
                  {mineTasks.length ? (
                    <div className="stu-courses">
                      <div className="stu-label">დავალებები ({mineTasks.length})</div>
                      {mineTasks.map((a) => {
                        const left = timeLeft(a.due_at);
                        const sub = handedIn(a);
                        return (
                          <div className={"hw-row" + (left.late && !sub ? " late" : "")} key={a.id}>
                            <div className="hw-main">
                              <b>{a.title}</b>
                              <span className="hw-task">{a.task}</span>
                              <span className="hw-meta">
                                {titleOf(a.course_id)} · {left.text}
                              </span>
                              {/* Tina's own comment, on the card she tracks from.
                                  It used to live only inside the grading form. */}
                              {sub?.feedback ? (
                                <span className="hw-said">{sub.feedback}</span>
                              ) : null}
                            </div>
                            <div className="hw-state">
                              {sub ? (
                                <>
                                  <span className={"hw-badge " + sub.status}>
                                    {sub.status === "done"
                                      ? "შემოწმებული"
                                      : sub.status === "redo"
                                        ? "გადასაკეთებელი"
                                        : "ჩაბარებულია"}
                                  </span>
                                  {/* The mark itself, where the state is. Knowing a
                                      task was checked without knowing what it got
                                      meant opening the homework tab to find out. */}
                                  {sub.grade ? (
                                    <span className={"hw-grade " + (markBand(sub.grade) ?? "")}>
                                      {markText(sub.grade)}
                                    </span>
                                  ) : null}
                                </>
                              ) : (
                                <span className="hw-badge waiting">ჯერ არ ჩაუბარებია</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {open ? (
                    <form
                      className="stu-give"
                      onSubmit={(ev) => {
                        ev.preventDefault();
                        const f = new FormData(ev.currentTarget);
                        grant(p.id, String(f.get("course")), String(f.get("days") || ""));
                        setOpenFor(null);
                      }}
                    >
                      <div className="field">
                        <label>რომელი კურსი?</label>
                        <select name="course" defaultValue="" required>
                          <option value="" disabled>
                            — აირჩიეთ —
                          </option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label>რამდენ დღეს გაგრძელდეს?</label>
                        <input
                          name="days"
                          type="number"
                          min={1}
                          placeholder="ცარიელი = უვადოდ"
                        />
                      </div>
                      <div className="stu-give-btns">
                        <button className="btn btn-plum" type="submit" disabled={busy}>
                          მიცემა და შეტყობინება
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => setOpenFor(null)}
                        >
                          გაუქმება
                        </button>
                      </div>
                    </form>
                  ) : assignFor === p.id ? (
                    <form
                      className="stu-give"
                      onSubmit={(ev) => {
                        ev.preventDefault();
                        assign(p.id, new FormData(ev.currentTarget));
                      }}
                    >
                      <div className="field">
                        <label>რომელ კურსზე?</label>
                        <select name="course" defaultValue={mine[0]?.course_id ?? ""} required>
                          <option value="" disabled>
                            — აირჩიეთ —
                          </option>
                          {(mine.length
                            ? courses.filter((c) => mine.some((e) => e.course_id === c.id))
                            : courses
                          ).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label>დავალების სათაური</label>
                        <input name="title" placeholder="მაგ. აპექსი ერთ ფრჩხილზე" required />
                      </div>
                      <div className="field">
                        <label>რა უნდა გააკეთოს</label>
                        <textarea
                          name="task"
                          rows={3}
                          placeholder="აღწერეთ დავალება — სტუდენტს წერილშივე მიუვა"
                          required
                        />
                      </div>
                      <div className="field">
                        <label>ვადა (სურვილისამებრ)</label>
                        <input name="due" type="date" />
                      </div>
                      <div className="stu-give-btns">
                        <button className="btn btn-plum" type="submit" disabled={busy}>
                          მიცემა და შეტყობინება
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => setAssignFor(null)}
                        >
                          გაუქმება
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="stu-give-btns">
                      <button
                        className="btn btn-plum stu-add"
                        onClick={() => {
                          setOpenFor(p.id);
                          setAssignFor(null);
                        }}
                        disabled={busy}
                      >
                        + კურსის მიცემა
                      </button>
                      <button
                        className="btn btn-ghost stu-add"
                        onClick={() => {
                          setAssignFor(p.id);
                          setOpenFor(null);
                        }}
                        disabled={busy || mine.length === 0}
                        title={
                          mine.length === 0 ? "ჯერ კურსი მიეცით" : undefined
                        }
                      >
                        + დავალების მიცემა
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      ) : null}

      {tab === "homework" ? (
        <>
          <div className="filters" style={{ marginBottom: 18 }}>
            <a className="chip" aria-pressed={hwPile === "sent"} onClick={() => setHwPile("sent")}>
              შესამოწმებელი ({hwCount("sent")})
            </a>
            <a className="chip" aria-pressed={hwPile === "redo"} onClick={() => setHwPile("redo")}>
              გადასაკეთებელი ({hwCount("redo")})
            </a>
            <a className="chip" aria-pressed={hwPile === "done"} onClick={() => setHwPile("done")}>
              შემოწმებული ({hwCount("done")})
            </a>
          </div>
          {hwShown.length === 0 ? (
        <p className="lead">
          {hwPile === "sent"
            ? "შესამოწმებელი არაფერია."
            : hwPile === "redo"
              ? "გადასაკეთებელი არაფერია."
              : "შემოწმებული ჯერ არაფერია."}
        </p>
      ) : (
        hwShown.map((s) => (
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
            {/* What it was given, as text. The form underneath can rewrite or clear
                it, but reading the verdict should not mean reading a form field. */}
            {s.grade || s.feedback ? (
              <div className="hw-verdict">
                {s.grade ? (
                  <span className={"hw-grade " + (markBand(s.grade) ?? "")}>{markText(s.grade)}</span>
                ) : null}
                {s.feedback ? <p>{s.feedback}</p> : null}
              </div>
            ) : null}
            {/* Keyed on the stored verdict so the fields below reload when it
                changes - an uncontrolled default is otherwise set once only, and
                a cleared mark would stay on screen. */}
            <form
              key={`${s.status}:${s.grade ?? ""}:${s.feedback ?? ""}`}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                grade(
                  s.id,
                  s.profile_id,
                  s.course_id,
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
              <div className="hw-acts">
                <button className="btn btn-plum" type="submit" disabled={busy}>
                  შენახვა
                </button>
                {s.grade || s.feedback || s.status !== "sent" ? (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={busy}
                    onClick={() => clearVerdict(s.id)}
                  >
                    შეფასების წაშლა
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        ))
          )}
        </>
      ) : null}
    
      {tab === "courses" ? <CoursesTab courses={catalog} /> : null}

      {tab === "mail" ? (
        <>
          <div className="adm-form">
            <h2>ახალი კურსის შეტყობინება</h2>
            <p className="lead" style={{ margin: "0 0 14px" }}>
              იგზავნება მხოლოდ იმ {subscriberCount} ანგარიშზე, რომელმაც სიახლეების მიღებაზე
              თანხმობა განაცხადა. ერთი კურსი ორჯერ არ გაიგზავნება.
            </p>
            <div className="adm-2">
              <div className="field">
                <label htmlFor="nc-course">კურსი</label>
                <select id="nc-course" defaultValue="">
                  <option value="" disabled>
                    აირჩიეთ კურსი
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ alignSelf: "end" }}>
                <button
                  className="btn btn-plum"
                  disabled={busy || subscriberCount === 0}
                  onClick={() => {
                    const el = document.getElementById("nc-course") as HTMLSelectElement | null;
                    notifyCourse(el?.value ?? "");
                  }}
                >
                  შეატყობინე სტუდენტებს
                </button>
              </div>
            </div>
          </div>

          <div className="adm-form">
            <h2>უმოქმედობის შეხსენება</h2>
            <p className="lead" style={{ margin: 0 }}>
              ავტომატურია. დღეში ერთხელ მოწმდება ვინ იყიდა კურსი და 6 დღეა არ შემოსულა —
              თითოეული ასეთი პერიოდისთვის იგზავნება ერთი შეხსენება, არა ყოველდღე.
              ხელით ჩარევა არ სჭირდება.
            </p>
          </div>

          <div className="adm-form">
            <h2>ბოლოს გაგზავნილი</h2>
            {emailLog.length === 0 ? (
              <p className="lead" style={{ margin: 0 }}>ჯერ არაფერი გაგზავნილა.</p>
            ) : (
              <div className="adm-list">
                {emailLog.map((row) => (
                  <div className="adm-row" key={row.id}>
                    <div className="adm-main">
                      <strong>{nameOf(row.user_id)}</strong>
                      <span className="mail">
                        {row.kind === "inactive"
                          ? "უმოქმედობის შეხსენება"
                          : "ახალი კურსი: " + titleOf(row.ref)}
                      </span>
                    </div>
                    <div className="adm-btns">
                      <span className="hint">
                        {new Date(row.sent_at).toLocaleDateString("ka-GE")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
