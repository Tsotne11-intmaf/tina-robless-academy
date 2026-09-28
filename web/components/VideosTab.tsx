"use client";

import { useEffect, useState } from "react";
import { COURSES } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";

/* Attaching a video to each lesson.

   Tina pastes whatever the video host gave her - the share link, the embed link,
   or the bare id - and what is stored is that reference. The file never comes
   near this site: the host keeps it, and this table only remembers which one. */

type Course = { id: string; title: string; modules: { title: string; lessons: { t: string }[] }[] };

const COURSE_LIST = COURSES as unknown as Course[];

function lessonsOf(c: Course) {
  const out: { i: number; module: string; title: string }[] = [];
  c.modules.forEach((m) => m.lessons.forEach((l) => out.push({ i: out.length, module: m.title, title: l.t })));
  return out;
}

export default function VideosTab() {
  const supabase = createClient();
  const [courseId, setCourseId] = useState(COURSE_LIST[0]?.id ?? "");
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const course = COURSE_LIST.find((c) => c.id === courseId);
  const lessons = course ? lessonsOf(course) : [];

  useEffect(() => {
    let live = true;
    setLoading(true);
    setMsg("");
    supabase
      .from("lesson_videos")
      .select("lesson_index,url")
      .eq("course_id", courseId)
      .then(({ data, error }) => {
        if (!live) return;
        setLoading(false);
        if (error) {
          setMsg("ვერ ჩაიტვირთა: " + error.message);
          return;
        }
        const next: Record<number, string> = {};
        (data ?? []).forEach((r) => {
          next[r.lesson_index as number] = (r.url as string) ?? "";
        });
        setUrls(next);
      });
    return () => {
      live = false;
    };
  }, [supabase, courseId]);

  async function save(i: number) {
    const url = (urls[i] ?? "").trim();
    setBusy(i);
    setMsg("");
    /* An emptied field means the lesson has no video, which is a removal rather
       than a blank reference nothing can play. */
    const { error } = url
      ? await supabase
          .from("lesson_videos")
          .upsert({ course_id: courseId, lesson_index: i, url }, { onConflict: "course_id,lesson_index" })
      : await supabase
          .from("lesson_videos")
          .delete()
          .eq("course_id", courseId)
          .eq("lesson_index", i);
    setBusy(null);
    setMsg(error ? "ვერ შეინახა: " + error.message : url ? "ვიდეო შენახულია." : "ვიდეო მოხსნილია.");
  }

  return (
    <>
      <div className="adm-form">
        <h2>გაკვეთილების ვიდეოები</h2>
        <p className="lead" style={{ margin: "0 0 14px" }}>
          ჩასვი ბმული, რომელიც ვიდეო-ჰოსტინგმა მოგცა — Bunny, Vimeo ან პირდაპირი ბმული.
          ვიდეო ჩნდება მხოლოდ იმ სტუდენტისთვის, ვისაც კურსი აქვს ნაყიდი.
        </p>
        <div className="field">
          <label htmlFor="vid-course">კურსი</label>
          <select id="vid-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {COURSE_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        {msg ? <p className={"auth-msg " + (msg.startsWith("ვერ") ? "bad" : "ok")}>{msg}</p> : null}
      </div>

      {loading ? (
        <p className="lead">იტვირთება…</p>
      ) : (
        lessons.map((l) => (
          <div className="adm-form vid-row" key={l.i}>
            <div>
              <b>
                {l.i + 1}. {l.title}
              </b>
              <div className="mail">{l.module}</div>
            </div>
            <div className="vid-set">
              <input
                value={urls[l.i] ?? ""}
                onChange={(e) => setUrls({ ...urls, [l.i]: e.target.value })}
                placeholder="ვიდეოს ბმული"
              />
              <button
                className="btn btn-plum"
                type="button"
                disabled={busy === l.i}
                onClick={() => save(l.i)}
              >
                შენახვა
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
