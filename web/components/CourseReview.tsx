"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/lib/uploadthing";

export type Review = {
  id: number;
  profile_id: string;
  author_name: string;
  body: string | null;
  photo_url: string | null;
  verified: boolean;
  created_at: string;
};

/* Anyone with an account may say what they think of a course, on any course.

   What used to be guaranteed by who could write is now recorded on the comment
   itself: one from someone who holds the course is marked as such, by the
   database rather than by the browser, so the mark cannot be claimed by asking
   for it. One review per person per course, rewritten rather than added to,
   which is why this saves by upsert. */
export default function CourseReview({
  courseId,
  authorName,
  mine,
}: {
  courseId: string;
  authorName: string;
  mine: Review | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [body, setBody] = useState(mine?.body ?? "");
  const [photo, setPhoto] = useState<string | null>(mine?.photo_url ?? null);
  const [busy, setBusy] = useState(false);
  /* Closed once something has been written. The form used to stay open with the
     comment already in it, which reads as "this did not send" - the comment is
     sitting in the list above at the same time. */
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "bad" } | null>(null);

  async function save() {
    if (!body.trim() && !photo) {
      setMsg({ text: "დაწერეთ კომენტარი ან ატვირთეთ ნიმუში.", kind: "bad" });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("course_reviews").upsert(
      {
        course_id: courseId,
        profile_id: mine?.profile_id ?? (await supabase.auth.getUser()).data.user?.id,
        author_name: authorName,
        body: body.trim() || null,
        photo_url: photo,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,course_id" }
    );
    setBusy(false);
    if (error) {
      setMsg({ text: "ვერ შეინახა: " + error.message, kind: "bad" });
      return;
    }
    setMsg({ text: mine ? "შენახულია." : "გმადლობთ! თქვენი კომენტარი გამოქვეყნდა.", kind: "ok" });
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!mine) return;
    if (!confirm("წავშალოთ თქვენი კომენტარი და ნიმუში?")) return;
    setBusy(true);
    const { error } = await supabase.from("course_reviews").delete().eq("id", mine.id);
    setBusy(false);
    if (error) {
      setMsg({ text: "ვერ წაიშალა: " + error.message, kind: "bad" });
      return;
    }
    setBody("");
    setPhoto(null);
    setMsg({ text: "წაიშალა.", kind: "ok" });
    router.refresh();
  }

  /* Already written and not being changed: say so and offer the two things that
     can be done about it. The comment itself is in the list above. */
  if (mine && !editing) {
    return (
      <div className="rev-form rev-done">
        <h3>თქვენი კომენტარი გამოქვეყნებულია</h3>
        <p className="rev-hint">ზემოთ, სხვების კომენტარებს შორის ჩანს.</p>
        {msg ? <p className={"auth-msg " + msg.kind}>{msg.text}</p> : null}
        <div className="rev-acts">
          <button className="btn btn-plum" type="button" onClick={() => setEditing(true)}>
            შეცვლა
          </button>
          <button className="btn btn-ghost" type="button" onClick={remove} disabled={busy}>
            წაშლა
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rev-form">
      <h3>{mine ? "კომენტარის შეცვლა" : "დატოვეთ კომენტარი"}</h3>
      <p className="rev-hint">
        დაწერეთ, როგორ წაგადგათ კურსი, და მიამაგრეთ ნამუშევარი — სხვა სტუდენტები ამას ხედავენ.
      </p>

      {/* The picture is attached from inside the box the comment is written in,
          the way a message carries one, rather than from a separate field below
          that read as a second, unrelated task. */}
      <div className="rev-box">
        <textarea
          rows={4}
          value={body}
          maxLength={1200}
          onChange={(e) => setBody(e.target.value)}
          placeholder="რა ისწავლეთ, რა შეიცვალა თქვენს ნამუშევრებში…"
        />

        <div className="rev-box-foot">
          {photo ? (
            <div className="rev-chip">
              {/* plain img: the file is on UploadThing's CDN, outside next/image config */}
              <img src={photo} alt="მიმაგრებული ნიმუში" />
              <button
                type="button"
                className="rev-chip-x"
                title="ფოტოს მოხსნა"
                onClick={() => setPhoto(null)}
              >
                ✕
              </button>
            </div>
          ) : (
            <UploadButton
              className="ut-inline"
              endpoint="avatar"
              content={{ button: "ნიმუშის მიმაგრება", allowedContent: "" }}
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.ufsUrl;
                if (url) setPhoto(url);
              }}
              onUploadError={(e: Error) =>
                setMsg({ text: "ფოტო ვერ აიტვირთა: " + e.message, kind: "bad" })
              }
            />
          )}
          <span className="rev-count">{body.length}/1200</span>
        </div>
      </div>

      {msg ? <p className={"auth-msg " + msg.kind}>{msg.text}</p> : null}

      <div className="rev-acts">
        <button className="btn btn-plum" type="button" onClick={save} disabled={busy}>
          {mine ? "შენახვა" : "გამოქვეყნება"}
        </button>
        {mine ? (
          <button
            className="btn btn-ghost"
            type="button"
            disabled={busy}
            onClick={() => {
              setBody(mine.body ?? "");
              setPhoto(mine.photo_url ?? null);
              setMsg(null);
              setEditing(false);
            }}
          >
            გაუქმება
          </button>
        ) : null}
      </div>
    </div>
  );
}
