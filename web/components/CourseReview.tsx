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
  created_at: string;
};

/* A student's say on a course she has taken, with the work to go with it.

   Only shown to someone who holds the course - the row policy says the same
   thing again, so the form being on the page is not what grants the right. One
   review per student per course, rewritten rather than added to, which is why
   this saves by upsert. */
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

  return (
    <div className="rev-form">
      <h3>{mine ? "თქვენი კომენტარი" : "დატოვეთ კომენტარი"}</h3>
      <p className="lead">
        დაწერეთ, როგორ წაგადგათ კურსი, და ატვირთეთ ნამუშევარი — სხვა სტუდენტები ამას ხედავენ.
      </p>

      <div className="field">
        <textarea
          rows={4}
          value={body}
          maxLength={1200}
          onChange={(e) => setBody(e.target.value)}
          placeholder="რა ისწავლეთ, რა შეიცვალა თქვენს ნამუშევრებში…"
        />
      </div>

      {photo ? (
        <div className="rev-pic">
          {/* plain img: the file is on UploadThing's CDN, outside next/image config */}
          <img src={photo} alt="ჩემი ნამუშევარი" />
          <button type="button" className="btn btn-ghost" onClick={() => setPhoto(null)}>
            ფოტოს მოხსნა
          </button>
        </div>
      ) : (
        <div className="field">
          <label>ნიმუშის ფოტო (სურვილისამებრ)</label>
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
      )}

      {msg ? <p className={"auth-msg " + msg.kind}>{msg.text}</p> : null}

      <div className="stu-give-btns">
        <button className="btn btn-plum" type="button" onClick={save} disabled={busy}>
          {mine ? "შენახვა" : "გამოქვეყნება"}
        </button>
        {mine ? (
          <button className="btn btn-ghost" type="button" onClick={remove} disabled={busy}>
            წაშლა
          </button>
        ) : null}
      </div>
    </div>
  );
}
