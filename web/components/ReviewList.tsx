"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/components/CourseReview";

/* What students have said, with a way to take one down: by its author, or by
   Tina, who needs to be able to remove something unpleasant from a page that
   sells a course. The row policy says the same thing, so the button being drawn
   is not what grants the right. */
export default function ReviewList({
  reviews,
  viewerId,
  canModerate,
}: {
  reviews: Review[];
  viewerId: string | null;
  canModerate: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function remove(id: number) {
    if (!confirm("წავშალოთ ეს კომენტარი?")) return;
    setBusy(id);
    await supabase.from("course_reviews").delete().eq("id", id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="rev-list">
      {reviews.map((r) => (
        <div className="rev" key={r.id}>
          <div className="rev-top">
            <b>{r.author_name || "სტუდენტი"}</b>
            <span>{new Date(r.created_at).toLocaleDateString("ka-GE")}</span>
            {canModerate || viewerId === r.profile_id ? (
              <button
                type="button"
                className="rev-del"
                title="წაშლა"
                disabled={busy === r.id}
                onClick={() => remove(r.id)}
              >
                ✕
              </button>
            ) : null}
          </div>
          <p>{r.body}</p>
        </div>
      ))}
    </div>
  );
}
