/* A homework mark, written and coloured the same way wherever it is shown - on
   the student's own page and on the card Tina tracks from. */

/* The number behind a mark, or null when there is none. Tina types marks by hand,
   so "8", "8.5", "8,5" and "8/10" all have to mean the same thing; anything
   written in words has no number and is left alone. */
function value(grade: string): number | null {
  const m = grade.trim().match(/^(\d{1,2}(?:[.,]\d)?)\s*(?:\/\s*10)?$/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return n >= 0 && n <= 10 ? n : null;
}

/* A bare number reads as an ordinal - "2" beside a task looks like the second one
   rather than two out of ten - so a plain number is written as a fraction. What is
   already a fraction, or is words, is shown exactly as it was typed. */
export function markText(grade: string): string {
  const v = grade.trim();
  return value(v) !== null && !v.includes("/") ? `${v}/10` : v;
}

/* The band a mark falls in, so its colour says how it went before the number is
   read: 5 and below has gone wrong, through 7 is a pass with work left, above
   that is good. Marks written in words have no band - there is nothing to rank. */
export function markBand(grade: string): "mark-low" | "mark-mid" | "mark-high" | null {
  const n = value(grade);
  if (n === null) return null;
  return n <= 5 ? "mark-low" : n <= 7 ? "mark-mid" : "mark-high";
}
