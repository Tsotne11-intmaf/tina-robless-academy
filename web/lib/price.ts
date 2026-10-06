/* Two ways to take a course, and what each costs.

   Every course is sold twice: on its own, and with Tina marking the homework.
   The cheaper one is what the site shows — a price people see before they know
   there is a choice — and the two appear together only at the moment of buying.

   The second price is derived rather than stored when Tina has not set one, so
   all thirteen courses had both prices the day the choice appeared, without her
   retyping any of them. Setting it overrides the sum. */

export const COACH_STEP = 50;

/* Prices are typed by hand: "590 ₾", "590₾", "590". The number is read out, and
   whatever was written around it is put back, so the currency mark, spacing and
   any wording survive a calculation. */
export function priceParts(price: string): { n: number; before: string; after: string } | null {
  const m = price.match(/^(\D*)(\d[\d\s,.]*)(\D*)$/);
  if (!m) return null;
  const n = parseFloat(m[2].replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? { n, before: m[1], after: m[3] } : null;
}

export function addToPrice(price: string, add: number): string | null {
  const p = priceParts(price);
  if (!p) return null;
  return `${p.before}${p.n + add}${p.after}`;
}

/* What the course costs with Tina marking the work: what she set, or the base
   price plus the step. Null when the base price is not a number at all, in which
   case the course simply has one price. */
export function coachPrice(price: string, stored?: string | null): string | null {
  const set = (stored ?? "").trim();
  if (set) return set;
  return addToPrice(price, COACH_STEP);
}
