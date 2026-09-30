import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { HOMEWORK } from "@/lib/catalog";
import type { Student } from "@/lib/student";

/* How much homework is still waiting, and when each piece is due.

   Both answers come from the same two queries, so the sidebar's count and the
   list on the homework page can never disagree. Wrapped in cache() because a
   page renders the sidebar and the list from one request. */

export type Due = { id: string; due: number | null };

export type Waiting = {
  /* Not handed in, or handed back to be redone. Anything already marked done or
     sitting with Tina is not the student's move. */
  count: number;
  /* The soonest deadline still outstanding, for the badge's title. */
  soonest: number | null;
};

export const waitingHomework = cache(async (student: Student): Promise<Waiting> => {
  if (!student.owned.length) return { count: 0, soonest: null };

  try {
    const supabase = await createClient();
    const [subRes, assignRes] = await Promise.all([
      supabase.from("submissions").select("task_id,status"),
      supabase.from("assignments").select("id,course_id,due_at"),
    ]);

    /* The catalogue's own exercises, plus whatever Tina set for this student.
       The prefix is the one the homework page uses, so the ids line up. */
    const tasks: Due[] = [
      ...(assignRes.data ?? []).map((a) => ({
        id: "a" + a.id,
        due: a.due_at ? new Date(a.due_at as string).getTime() : null,
      })),
      ...(HOMEWORK as unknown as { id: string; course: string }[])
        .filter((t) => student.owned.includes(t.course))
        .map((t) => ({ id: t.id, due: null })),
    ];

    const status = new Map<string, string>();
    for (const s of subRes.data ?? []) status.set(s.task_id as string, s.status as string);

    const open = tasks.filter((t) => {
      const st = status.get(t.id);
      return st === undefined || st === "redo";
    });

    const dues = open.map((t) => t.due).filter((d): d is number => d !== null);
    return { count: open.length, soonest: dues.length ? Math.min(...dues) : null };
  } catch {
    // A badge is not worth failing a page over.
    return { count: 0, soonest: null };
  }
});

export { timeLeft } from "@/lib/due";
