import Link from "next/link";
import type { CourseItem } from "@/lib/catalog";

/* Ports badgeHTML() and priceHTML() from the legacy app. The percentage on a sale
   badge is derived from was/price rather than stored, exactly as before, so a badge
   can never disagree with the prices next to it. */

export function discountPct(c: CourseItem): number {
  const num = (s?: string) => (s ? parseInt(String(s).replace(/[^0-9]/g, ""), 10) : 0);
  const was = num(c.was);
  const now = num(c.price);
  if (!was || !now || was <= now) return 0;
  return Math.round(((was - now) / was) * 100);
}

export function Badge({ c }: { c: CourseItem }) {
  if (c.badge === "package") return <span className="cbadge package">პაკეტი</span>;
  if (c.badge === "premium")
    return (
      <span className="cbadge premium">
        <i>✦</i> პრემიუმ
      </span>
    );
  if (c.badge === "sale") {
    const d = discountPct(c);
    return <span className="cbadge sale">ფასდაკლება{d ? ` −${d}%` : ""}</span>;
  }
  return null;
}

export function Price({ c }: { c: CourseItem }) {
  return (
    <>
      {c.badge === "sale" && c.was ? <s className="was">{c.was}</s> : null}
      <span className={"price" + (c.badge === "premium" ? " gold" : "")}>{c.price}</span>
    </>
  );
}

export default function CourseCard({ c }: { c: CourseItem }) {
  return (
    <article className={"card" + (c.badge === "premium" ? " is-premium" : "")}>
      <Link
        className={"thumb " + (c.photo ? "" : c.img || "")}
        href={`/kurs/${c.id}`}
        style={c.photo ? { background: `url(${c.photo}) center/cover` } : undefined}
      >
        <Badge c={c} />
      </Link>
      <div className="card-body">
        <h3>
          <Link href={`/kurs/${c.id}`}>{c.title}</Link>
        </h3>
        <p>{c.desc}</p>
        <div className="card-foot">
          <span className="dur">{c.dur}</span>
          <span className="pw">
            <Price c={c} />
          </span>
        </div>
        <Link
          className="btn btn-ghost"
          style={{ marginTop: 14, justifyContent: "center" }}
          href={`/kurs/${c.id}`}
        >
          კურსის გახსნა
        </Link>
      </div>
    </article>
  );
}
