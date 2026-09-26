import Link from "next/link";
import { CATALOG, CATS } from "@/lib/catalog";

export default function Home() {
  const featured = CATALOG.slice(0, 6);
  return (
    <>
      <header>
        <div className="wrap nav">
          <Link className="logo" href="/">
            Tina&nbsp;<span>Robless</span>
          </Link>
          <div className="nav-right">
            <Link href="/upload-test" style={{ fontWeight: 500 }}>
              ატვირთვის ტესტი
            </Link>
            <Link className="btn btn-plum" href="#courses">
              კურსების ნახვა
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="wrap hero-grid">
            <div>
              <p className="ka">
                CMC მსოფლიო ჩემპიონი · Georgia Nails-ის პრეზიდენტი · თბილისი
              </p>
              <h1>გახადე ფრჩხილები ხელოვნების ნიმუში</h1>
              <div className="hero-cta">
                <Link className="btn btn-plum" href="#courses">
                  ყველა კურსი
                </Link>
              </div>
              <div className="hero-meta">
                <span>ერთჯერადი გადახდა</span>
                <span>მყისიერი წვდომა</span>
                <span>უვადო წვდომა</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="courses">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <h2>ყველაზე პოპულარული კურსები</h2>
              </div>
            </div>
            <div className="cards">
              {featured.map((c: any) => (
                <article className="card" key={c.id}>
                  <div className={"thumb " + (c.img || "")} />
                  <div className="card-body">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    <div className="card-foot">
                      <span className="incl">{CATS[c.cat] ?? c.cat}</span>
                      <span className="price">{c.price}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
