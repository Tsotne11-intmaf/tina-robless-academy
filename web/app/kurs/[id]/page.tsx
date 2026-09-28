import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATALOG, CATS } from "@/lib/catalog";
import { courseById } from "@/lib/catalog-db";
import { getStudent } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import CourseReview, { type Review } from "@/components/CourseReview";
import ReviewList from "@/components/ReviewList";
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
  const c = await courseById(id);
  if (!c) return { title: "კურსი ვერ მოიძებნა" };
  const title = c.title + " — Tina Robless Nail Academy";
  /* A shared course shows its own photo. Only an uploaded one is a picture a
     messenger can fetch - the launch courses carry a CSS class, not a file, and
     those fall back to the site's own card. */
  const images = c.photo ? [{ url: c.photo, alt: c.title }] : undefined;
  return {
    title,
    description: c.desc,
    openGraph: { type: "article", title, description: c.desc, url: `/kurs/${c.id}`, images },
    twitter: { card: "summary_large_image", title, description: c.desc },
  };
}

export default async function KursPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await courseById(id);
  if (!c) notFound();

  const t = await getT();

  /* Who is looking, and what they may do about it. A visitor gets the reviews
     and nothing else; someone who holds the course gets the form as well. */
  const student = await getStudent();
  const owned = !!student?.owned.includes(id);

  const supabase = await createClient();
  // Tina browses the site signed in, so moderating is done where the comment is.
  const { data: isAdmin } = student ? await supabase.rpc("is_admin") : { data: false };
  const { data: reviewRows } = await supabase
    .from("course_reviews")
    .select("id,profile_id,author_name,body,photo_url,created_at")
    .eq("course_id", id)
    .order("created_at", { ascending: false });
  const reviews = (reviewRows ?? []) as Review[];
  const mine = student ? reviews.find((r) => r.profile_id === student.userId) ?? null : null;
  const samples = reviews.filter((r) => r.photo_url);
  const said = reviews.filter((r) => r.body);

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
            {samples.length ? (
              <div className="rev-gallery">
                {samples.map((r) => (
                  /* plain img: the file is on UploadThing's CDN, outside next/image config */
                  <img key={r.id} src={r.photo_url!} alt={r.author_name} loading="lazy" />
                ))}
              </div>
            ) : (
              <p className="lead">{t("ჯერ არავის აუტვირთავს.")}</p>
            )}

            <h2 style={{ fontSize: "1.7rem", margin: "40px 0 14px" }}>{t("კომენტარები")}</h2>
            {said.length ? (
              <ReviewList reviews={said} viewerId={student?.userId ?? null} canModerate={isAdmin === true} />
            ) : (
              <p className="lead">{t("კომენტარები ჯერ არ არის.")}</p>
            )}

            {owned ? (
              <CourseReview
                courseId={c.id}
                authorName={student!.name || student!.email.split("@")[0]}
                mine={mine}
              />
            ) : null}
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

            {/* Offering to sell a course someone has already bought reads as though
                the site has forgotten them. */}
            {owned ? (
              <>
                <p className="buy-owned">✓ {t("კურსი შეძენილია")}</p>
                <Link
                  className="btn btn-plum"
                  style={{ justifyContent: "center", width: "100%" }}
                  href={`/course/${c.id}`}
                >
                  {t("სწავლის გაგრძელება")}
                </Link>
              </>
            ) : (
              <>
                <BuyButton courseId={c.id} />
                <Link
                  className="btn btn-ghost"
                  style={{ justifyContent: "center", width: "100%", marginTop: 10 }}
                  href="/login"
                >
                  {t("უკვე გაქვთ? შესვლა")}
                </Link>
              </>
            )}

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
