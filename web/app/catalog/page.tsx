import Link from "next/link";
import { CATALOG, CATS } from "@/lib/catalog";
import CourseCard from "@/components/CourseCard";

/* Replaces SHOP.catalog(). The chosen category now lives in the URL as ?cat=, so a
   filtered catalogue can be linked and indexed - the legacy hash router could do
   neither. Rendered on the server, so the courses are visible without JavaScript. */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "all" } = await searchParams;
  const list = cat === "all" ? CATALOG : CATALOG.filter((c) => c.cat === cat);

  return (
    <section className="lms">
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">მთავარი</Link> / ყველა კურსი
        </div>
        <h1 style={{ marginBottom: 10 }}>ყველა კურსი</h1>
        <p className="lead" style={{ marginBottom: 26 }}>
          {CATALOG.length} კურსი. გახსენით ნებისმიერი — ნახეთ პროგრამა, სხვების
          კომენტარები და ატვირთეთ თქვენი ნიმუში.
        </p>

        <div className="filters">
          {Object.keys(CATS).map((k) => (
            <Link
              key={k}
              className="chip"
              href={k === "all" ? "/catalog" : "/catalog?cat=" + k}
              aria-pressed={k === cat}
            >
              {CATS[k]}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="lead">ამ კატეგორიაში კურსი ჯერ არ არის.</p>
        ) : (
          <div className="cards">
            {list.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
