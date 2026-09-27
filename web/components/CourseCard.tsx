import Link from "next/link";
import type { CourseItem } from "@/lib/catalog";
import { getT } from "@/lib/i18n";

/* Ports badgeHTML() and priceHTML() from the legacy app. The percentage on a sale
   badge is derived from was/price rather than stored, exactly as before, so a badge
   can never disagree with the prices next to it.

   Everything a visitor reads here goes through the translator. The catalogue is
   written in Georgian and the dictionary already holds all thirteen titles,
   descriptions and durations - they were simply never looked up, so the header
   switched language while the courses underneath it stayed Georgian. */

export function discountPct(c: CourseItem): number {
  const num = (s?: string) => (s ? parseInt(String(s).replace(/[^0-9]/g, ""), 10) : 0);
  const was = num(c.was);
  const now = num(c.price);
  if (!was || !now || was <= now) return 0;
  return Math.round(((was - now) / was) * 100);
}

export async function Badge({ c }: { c: CourseItem }) {
  const t = await getT();
  if (c.badge === "package") return <span className="cbadge package">{t("პაკეტი")}</span>;
  if (c.badge === "premium")
    return (
      <span className="cbadge premium">
        <i>✦</i> {t("პრემიუმ")}
      </span>
    );
  if (c.badge === "sale") {
    const d = discountPct(c);
    return (
      <span className="cbadge sale">
        {t("ფასდაკლება")}
        {d ? ` −${d}%` : ""}
      </span>
    );
  }
  return null;
}

/* Prices are numerals and a currency mark, which read the same in all four
   languages, so they are deliberately left alone. */
export function Price({ c }: { c: CourseItem }) {
  return (
    <>
      {c.badge === "sale" && c.was ? <s className="was">{c.was}</s> : null}
      <span className={"price" + (c.badge === "premium" ? " gold" : "")}>{c.price}</span>
    </>
  );
}

export default async function CourseCard({ c }: { c: CourseItem }) {
  const t = await getT();
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
          <Link href={`/kurs/${c.id}`}>{t(c.title)}</Link>
        </h3>
        <p>{t(c.desc)}</p>
        <div className="card-foot">
          <span className="dur">{t(c.dur)}</span>
          <span className="pw">
            <Price c={c} />
          </span>
        </div>
        <Link
          className="btn btn-ghost"
          style={{ marginTop: 14, justifyContent: "center" }}
          href={`/kurs/${c.id}`}
        >
          {t("კურსის გახსნა")}
        </Link>
      </div>
    </article>
  );
}
