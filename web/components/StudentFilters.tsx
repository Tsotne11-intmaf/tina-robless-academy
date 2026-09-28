"use client";

import { useEffect, useState } from "react";

/* The graduates page's filter chips.

   They shipped as seven buttons with their pressed state written into the
   markup and no handler behind any of them - pressing one did nothing, and the
   first was permanently drawn as selected.

   The chips are built from the cards rather than listed here, so a chip can
   never name a course nobody took, and none of them can come back empty. Two of
   the original seven - "learned online" and "learned in Tbilisi" - are gone,
   because a card records the course and where the student works now, not where
   they sat while learning; those two could not have filtered anything. */
export default function StudentFilters({ allLabel }: { allLabel: string }) {
  const [courses, setCourses] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);

  const cards = () =>
    Array.from(document.querySelectorAll<HTMLElement>(".students-grid .student"));

  const courseOf = (el: HTMLElement) =>
    el.querySelector<HTMLElement>(".course")?.textContent?.trim() ?? "";

  // Read after paint, and again if the text is edited on the page.
  useEffect(() => {
    const read = () => {
      const seen: string[] = [];
      for (const el of cards()) {
        const c = courseOf(el);
        if (c && !seen.includes(c)) seen.push(c);
      }
      setCourses(seen);
    };
    read();
    const grid = document.querySelector(".students-grid");
    if (!grid) return;
    const mo = new MutationObserver(read);
    mo.observe(grid, { subtree: true, characterData: true, childList: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    for (const el of cards()) {
      el.style.display = pick === null || courseOf(el) === pick ? "" : "none";
    }
    /* Left showing everything on the way out. The cards are server-rendered and
       outlive this component, so a hidden one would stay hidden. */
    return () => {
      for (const el of cards()) el.style.display = "";
    };
  }, [pick, courses]);

  return (
    <div className="filters" aria-label={allLabel}>
      <button type="button" aria-pressed={pick === null} onClick={() => setPick(null)}>
        {allLabel}
      </button>
      {courses.map((c) => (
        <button key={c} type="button" aria-pressed={pick === c} onClick={() => setPick(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}
