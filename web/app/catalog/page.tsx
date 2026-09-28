import Link from "next/link";
import { CATS } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-db";
import CourseCard from "@/components/CourseCard";
import { getT } from "@/lib/i18n";
import { getStudent } from "@/lib/student";

export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("კურსები") + " \u2014 Tina Robless Nail Academy",
    description: t("ფრჩხილების ონლაინ კურსები: მასტერ-პროგრამები, ტექნიკა და დიზაინი."),
  };
}

/* Replaces SHOP.catalog(). The chosen category now lives in the URL as ?cat=, so a
   filtered catalogue can be linked and indexed - the legacy hash router could do
   neither. Rendered on the server, so the courses are visible without JavaScript. */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "all" } = await searchParams;
  const t = await getT();
  /* Empty for a visitor who is not signed in, which is every card's default. */
  const owned = (await getStudent())?.owned ?? [];
  const CATALOG = await getCatalog();
  const list = cat === "all" ? CATALOG : CATALOG.filter((c) => c.cat === cat);

  return (
    <section className="lms">
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">{t("მთავარი")}</Link> / {t("ყველა კურსი")}
        </div>
        <h1 style={{ marginBottom: 10 }}>{t("ყველა კურსი")}</h1>
        <p className="lead" style={{ marginBottom: 26 }}>
          {CATALOG.length}{" "}
          {t(
            "კურსი. გახსენით ნებისმიერი — ნახეთ პროგრამა, სხვების კომენტარები და ატვირთეთ თქვენი ნიმუში."
          )}
        </p>

        <div className="filters">
          {Object.keys(CATS).map((k) => (
            <Link
              key={k}
              className="chip"
              href={k === "all" ? "/catalog" : "/catalog?cat=" + k}
              aria-pressed={k === cat}
            >
              {t(CATS[k])}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="lead">{t("ამ კატეგორიაში კურსი ჯერ არ არის.")}</p>
        ) : (
          <div className="cards">
            {list.map((c) => (
              <CourseCard key={c.id} c={c} owned={owned.includes(c.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
