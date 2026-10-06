"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/lib/uploadthing";
import type { AdminCourse } from "@/components/CoursesTab";

/* The recordings, part by part.

   This listed two courses, because it read the lesson structure that lives in
   the code and only two courses have one. It now lists every course in the
   catalogue and shows as many slots as that course says it is split into, which
   Tina sets when she creates it.

   Each slot takes a file, not a link. A pasted link still works - a video kept
   at Bunny or Vimeo is a link - so the field stays, and uploading simply fills
   it in. */

type Row = { url: string; saved: string; pct: number | null };

export default function VideosTab({ courses }: { courses: AdminCourse[] }) {
  const supabase = createClient();
  const live = courses.filter((c) => !c.hidden);
  const [courseId, setCourseId] = useState(live[0]?.id ?? "");
  const [rows, setRows] = useState<Record<number, Row>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "bad" } | null>(null);

  const course = live.find((c) => c.id === courseId);
  const partCount = Math.min(Math.max(course?.parts ?? 1, 1), 60);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setMsg(null);
    supabase
      .from("lesson_videos")
      .select("lesson_index,url")
      .eq("course_id", courseId)
      .then(({ data, error }) => {
        if (!alive) return;
        setLoading(false);
        if (error) {
          setMsg({ text: "ვერ ჩაიტვირთა: " + error.message, kind: "bad" });
          return;
        }
        const next: Record<number, Row> = {};
        for (const r of data ?? []) {
          const u = (r.url as string) ?? "";
          next[r.lesson_index as number] = { url: u, saved: u, pct: null };
        }
        setRows(next);
      });
    return () => {
      alive = false;
    };
  }, [supabase, courseId]);

  const at = (i: number): Row => rows[i] ?? { url: "", saved: "", pct: null };
  const set = (i: number, patch: Partial<Row>) =>
    setRows((r) => ({ ...r, [i]: { ...at(i), ...patch } }));

  async function save(i: number) {
    const url = at(i).url.trim();
    setBusy(i);
    setMsg(null);
    /* An emptied field means the part has no video, which is a removal rather
       than a blank reference nothing can play. */
    const { error } = url
      ? await supabase
          .from("lesson_videos")
          .upsert(
            { course_id: courseId, lesson_index: i, url },
            { onConflict: "course_id,lesson_index" }
          )
      : await supabase
          .from("lesson_videos")
          .delete()
          .eq("course_id", courseId)
          .eq("lesson_index", i);
    setBusy(null);
    if (error) {
      setMsg({ text: "ვერ შეინახა: " + error.message, kind: "bad" });
      return;
    }
    set(i, { saved: url });
    setMsg({ text: url ? `ნაწილი ${i + 1} შენახულია.` : `ნაწილი ${i + 1} მოხსნილია.`, kind: "ok" });
  }

  return (
    <>
      <div className="adm-form">
        <h2>გაკვეთილების ვიდეოები</h2>
        <p className="lead" style={{ margin: "0 0 14px" }}>
          ატვირთე ვიდეო პირდაპირ, ან ჩასვი ბმული, თუ Bunny-ზე ან Vimeo-ზე გაქვს. ვიდეო ჩნდება
          მხოლოდ იმ სტუდენტისთვის, ვისაც კურსი აქვს ნაყიდი.
        </p>
        <div className="field">
          <label htmlFor="vid-course">კურსი</label>
          <select id="vid-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {live.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} — {Math.min(Math.max(c.parts ?? 1, 1), 60)} ნაწილი
              </option>
            ))}
          </select>
          <p className="hint" style={{ textAlign: "left", marginTop: 4 }}>
            ნაწილების რაოდენობა კურსის რედაქტირებაში იცვლება.
          </p>
        </div>
        {msg ? <p className={"auth-msg " + msg.kind}>{msg.text}</p> : null}
      </div>

      {loading ? (
        <p className="lead">იტვირთება…</p>
      ) : (
        Array.from({ length: partCount }, (_, i) => {
          const row = at(i);
          const changed = row.url.trim() !== row.saved;
          return (
            <div className="adm-form vid-row" key={i}>
              <div>
                <b>ნაწილი {i + 1}</b>
                <div className="mail">
                  {row.saved ? "✓ ვიდეო მიბმულია" : "ჯერ ცარიელია"}
                </div>
                {row.saved ? (
                  <a className="crs-vid" href={row.saved} target="_blank" rel="noopener">
                    ▶ შემოწმება
                  </a>
                ) : null}
              </div>

              <div className="vid-set">
                <input
                  value={row.url}
                  onChange={(e) => set(i, { url: e.target.value })}
                  placeholder="ატვირთე ან ჩასვი ბმული"
                />
                <UploadButton
                  className="ut-inline"
                  endpoint="courseVideo"
                  content={{
                    button: ({ isUploading, uploadProgress }) =>
                      isUploading ? `${uploadProgress ?? 0}%` : "ატვირთვა",
                    allowedContent: "",
                  }}
                  onUploadBegin={() => {
                    set(i, { pct: 0 });
                    setMsg({ text: "ვიდეო იტვირთება — არ დახუროთ გვერდი.", kind: "ok" });
                  }}
                  onUploadProgress={(p) => set(i, { pct: p })}
                  onClientUploadComplete={(res) => {
                    const url = res?.[0]?.ufsUrl;
                    set(i, { pct: null, ...(url ? { url } : {}) });
                    if (url) setMsg({ text: "აიტვირთა. დააჭირეთ შენახვას.", kind: "ok" });
                  }}
                  onUploadError={(e: Error) => {
                    set(i, { pct: null });
                    setMsg({ text: "ვერ აიტვირთა: " + e.message, kind: "bad" });
                  }}
                />
                <button
                  className="btn btn-plum"
                  type="button"
                  disabled={busy === i || !changed}
                  onClick={() => save(i)}
                >
                  შენახვა
                </button>
              </div>

              {row.pct !== null ? (
                <div className="up-bar" style={{ gridColumn: "1 / -1" }}>
                  <i style={{ width: row.pct + "%" }} />
                  <b>{row.pct}%</b>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </>
  );
}
