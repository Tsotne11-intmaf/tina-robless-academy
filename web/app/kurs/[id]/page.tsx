import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATALOG, CATS } from "@/lib/catalog";
import { Badge, Price } from "@/components/CourseCard";
import BuyButton from "@/components/BuyButton";
import { getT } from "@/lib/i18n";

/* Replaces SHOP.course(). Each course is now a real URL that Google can index,
   with its own title and description - the legacy hash router exposed a single
   page to crawlers no matter which course was open. */

export function generateStaticParams() {
  return CATALOG.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = CATALOG.find((x) => x.id === id);
  if (!c) return { title: "კურსი ვერ მოიძებნა" };
  return { title: c.title + " — Tina Robless Nail Academy", description: c.desc };
}

export default async function KursPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = CATALOG.find((x) => x.id === id);
  if (!c) notFound();

  const t = await getT();

  return (
    <section className="lms">
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">{t("მთავარი")}</Link> / <Link href="/catalog">{t("ყველა კურსი")}</Link> /{" "}
          <Link href={"/catalog?cat=" + c.cat}>{t(CATS[c.cat] ?? c.cat)}</Link>
        </div>

        <div className="kurs-grid">
          <div>
            <h1 style={{ marginBottom: 12 }}>{t(c.title)}</h1>
            <p className="lead" style={{ fontSize: "1.1rem", marginBottom: 26 }}>
              {t(c.desc)}
            </p>

            <div
              className={"thumb " + (c.photo ? "" : c.img || "")}
              style={{
                aspectRatio: "16/9",
                borderRadius: "var(--r-card)",
                marginBottom: 34,
                ...(c.photo ? { background: `url(${c.photo}) center/cover` } : {}),
              }}
            />

            {c.learn?.length ? (
              <>
                <h2 style={{ fontSize: "1.7rem", marginBottom: 14 }}>{t("რას ისწავლით")}</h2>
                <ul className="learn">
                  {c.learn.map((l, i) => (
                    <li key={i}>{t(l)}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <h2 style={{ fontSize: "1.7rem", margin: "34px 0 14px" }}>
              {t("სტუდენტების ნიმუშები")}
            </h2>
            <p className="lead">
              {t("ჯერ არავის აუტვირთავს.")}
            </p>

            <h2 style={{ fontSize: "1.7rem", margin: "40px 0 14px" }}>{t("კომენტარები")}</h2>
            <p className="lead">{t("კომენტარები ჯერ არ არის.")}</p>
          </div>

          <aside className={"buy" + (c.badge === "premium" ? " is-premium" : "")}>
            {c.badge ? (
              <div style={{ marginBottom: 12 }}>
                <Badge c={c} />
              </div>
            ) : null}
            <div className={"buy-price" + (c.badge === "premium" ? " gold" : "")}>
              <Price c={c} />
            </div>
            <div className="buy-dur">{t(c.dur)}</div>

            <BuyButton courseId={c.id} />

            <Link
              className="btn btn-ghost"
              style={{ justifyContent: "center", width: "100%", marginTop: 10 }}
              href="/login"
            >
              {t("უკვე გაქვთ? შესვლა")}
            </Link>

            {c.incl?.length ? (
              <>
                <h4>{t("რა შედის")}</h4>
                <ul>
                  {c.incl.map((i, k) => (
                    <li key={k}>{t(i)}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="small">
              {t("ერთჯერადი გადახდა")} ·{" "}
              {c.access === "days" && c.accessDays
                ? `${t("წვდომა")} ${c.accessDays} ${t("დღე")}`
                : t("უვადო წვდომა")}{" "}
              · {t("სერტიფიკატი")} ·{" "}
              <Link href="/refund" style={{ borderBottom: "1px solid var(--blush)" }}>
                {t("14 დღე თანხის დაბრუნება")}
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
