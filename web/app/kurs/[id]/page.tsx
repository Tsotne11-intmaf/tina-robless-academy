import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATALOG, CATS } from "@/lib/catalog";
import { courseById } from "@/lib/catalog-db";
import { getStudent } from "@/lib/student";
import { createClient } from "@/lib/supabase/server";
import { playerFor } from "@/lib/video";
import CourseReview, { type Review } from "@/components/CourseReview";
import ReviewList from "@/components/ReviewList";
import CourseMedia from "@/components/CourseMedia";
import { coachPrice } from "@/lib/price";
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
  /* Tina browses the site signed in, so moderating is done where the comment is.
     Read from the session rather than asked again - getStudent has already been
     told, and asking twice is a second round trip on every view. */
  const isAdmin = student?.isAdmin === true;
  const { data: reviewRows } = await supabase
    .from("course_reviews")
    .select("id,profile_id,author_name,body,photo_url,verified,created_at")
    .eq("course_id", id)
    .order("created_at", { ascending: false });
  const reviews = (reviewRows ?? []) as Review[];
  const mine = student ? reviews.find((r) => r.profile_id === student.userId) ?? null : null;
  const samples = reviews.filter((r) => r.photo_url);
  const said = reviews.filter((r) => r.body);

  /* The course video takes the photo's place, but only for someone who has paid
     for it (or Tina, checking her upload). Decided here on the server, so the
     address is never in the page anyone else receives.

     Whether a video exists is not a secret, though - it is a reason to buy. The
     poster says so and stays locked; only the address is withheld. */
  /* Owning the course is the only thing that opens it, Tina included. The sales
     page is what a buyer is shown, so she has to be able to see what that is;
     checking her own upload belongs in the admin panel, where the course list
     now links to it. */
  const player = owned ? playerFor(c.video) : null;
  const hasVideo = playerFor(c.video) !== null;

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

            <CourseMedia
              photo={c.photo ?? null}
              img={c.img ?? null}
              locked={hasVideo && !owned}
              lockedTitle={t("ამ კურსს ვიდეო აქვს")}
              lockedNote={t("ნახვა კურსის შეძენის შემდეგ")}
              player={player}
              title={c.title}
              shots={samples.map((r) => ({
                url: r.photo_url!,
                name: r.author_name || "სტუდენტი",
              }))}
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
                  <figure key={r.id}>
                    {/* plain img: the file is on UploadThing's CDN, outside next/image config */}
                    <img src={r.photo_url!} alt={r.author_name} loading="lazy" />
                    {/* Whose work it is. A wall of pictures said nothing about that. */}
                    <figcaption>
                      {r.author_name || "სტუდენტი"}
                      {r.verified ? <i>✓</i> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="lead">{t("ჯერ არავის აუტვირთავს.")}</p>
            )}

            <h2 style={{ fontSize: "1.7rem", margin: "40px 0 14px" }}>{t("კომენტარები")}</h2>
            {said.length ? (
              <ReviewList reviews={said} viewerId={student?.userId ?? null} canModerate={isAdmin} />
            ) : (
              <p className="lead">{t("კომენტარები ჯერ არ არის.")}</p>
            )}

            {/* Only someone holding the course may write about it. An opinion
                from a reader who has not taken it is worth less than none, and
                the row policy refuses the write in any case - this is what the
                page says rather than what it enforces. */}
            {owned && student ? (
              <CourseReview
                courseId={c.id}
                authorName={student.name || student.email.split("@")[0]}
                mine={mine}
              />
            ) : (
              <div className="rev-form rev-signin">
                <h3>{t("დატოვეთ კომენტარი")}</h3>
                <p className="rev-hint">{t("კომენტარს წერენ ისინი, ვისაც ეს კურსი გავლილი აქვს.")}</p>
                {!student ? (
                  <Link className="btn btn-plum" href={`/login?next=/kurs/${c.id}`}>
                    {t("შესვლა")}
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          <aside className="buy">
            {c.badge ? (
              <div style={{ marginBottom: 12 }}>
                <Badge c={c} />
              </div>
            ) : null}
            <div className="buy-price">
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
                <BuyButton
                  courseId={c.id}
                  price={c.price}
                  pricePlus={coachPrice(c.price, c.pricePlus)}
                />
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
