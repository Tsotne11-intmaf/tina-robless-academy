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

/* A course the reader already holds says so on the card, and sends them to the
   lessons rather than back to the page that sells it. Without this the catalogue
   looks the same whether or not she has bought anything. */
export default async function CourseCard({ c, owned }: { c: CourseItem; owned?: boolean }) {
  const t = await getT();
  return (
    <article
      className={"card" + (c.badge === "premium" ? " is-premium" : "") + (owned ? " is-owned" : "")}
    >
      <Link
        className={"thumb " + (c.photo ? "" : c.img || "")}
        href={owned ? `/course/${c.id}` : `/kurs/${c.id}`}
        style={c.photo ? { background: `url(${c.photo}) center/cover` } : undefined}
      >
        <Badge c={c} />
        {owned ? <span className="owned-tag">✓ {t("შეძენილია")}</span> : null}
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
          className={"btn " + (owned ? "btn-plum" : "btn-ghost")}
          style={{ marginTop: 14, justifyContent: "center" }}
          href={owned ? `/course/${c.id}` : `/kurs/${c.id}`}
        >
          {owned ? t("სწავლის გაგრძელება") : t("კურსის გახსნა")}
        </Link>
      </div>
    </article>
  );
}
