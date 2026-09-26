/* Generated from the legacy single-file app: <main data-page="about">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app, so they are reconnected deliberately rather than guessed at. */
import { getT } from "@/lib/i18n";

export default async function AboutPage() {
  const t = await getT();
  return (
    <>
      
      <div className="page-head">
        <div className="wrap">
          <div className="crumbs"><a href="/">{t("მთავარი")}</a> {t("/ ჩემ შესახებ")}</div>
          <p className="ka" data-edit="t.about.1">{t("თინა კუჭუხიზე")}</p>
          <h1 data-edit="t.about.2">{t("ჩემ შესახებ")}</h1>
          <p data-edit="t.about.3">{t("ფრჩხილების მასტერი და პედაგოგი თბილისიდან, ონლაინ ცნობილი როგორც Tina Robless.")}</p>
        </div>
      </div>
      
      <section>
        <div className="wrap about-grid">
          <div>
            <div className="portrait" data-img="about.portrait" style={{background: "url(data:image/jpeg", borderColor: "var(--line)"}}></div>
            <div className="creds" style={{marginTop: "22px"}}>
              <span style={{borderColor: "var(--line)", color: "var(--ink)"}}>{t("CMC მსოფლიო ჩემპიონი")}</span><span style={{borderColor: "var(--line)", color: "var(--ink)"}}>{t("Georgia Nails-ის პრეზიდენტი")}</span><span style={{borderColor: "var(--line)", color: "var(--ink)"}}>CAT</span><span style={{borderColor: "var(--line)", color: "var(--ink)"}}>{t("ფრჩხილების მასტერი, თბილისი")}</span><span style={{borderColor: "var(--line)", color: "var(--ink)"}}>{t("პედაგოგი")}</span>
            </div>
            <div className="socials" style={{marginTop: "6px"}}>
              <a href="https://www.instagram.com/tinarobless_/" target="_blank" rel="noopener">Instagram @tinarobless_</a>
              <a href="https://www.tiktok.com/@tinarobless" target="_blank" rel="noopener">TikTok @tinarobless</a>
              <a href="https://www.facebook.com/tiniko.kuchukhidze" target="_blank" rel="noopener">Facebook</a>
            </div>
          </div>
          <div>
            <h2 style={{marginBottom: "20px"}} data-edit="t.about.4">{t("გრძელი ფრჩხილები ჩემი მთელი საქმეა.")}</h2>
            <p style={{marginBottom: "16px"}} data-edit="t.about.5">{t("მე ვარ თინა კუჭუხიზე — Tina Robless Instagram-სა და TikTok-ზე. ვმუშაობ თბილისში და ყოველდღე ვაშენებ გრძელ ამერიკულ ფრჩხილებს: ექსტრემალური სიგრძე, სუფთა ფრენჩი, ვარდისფერი ნამუშევრები, კრისტალები და ჩარმები, რომლებიც ერთი თვე ადგილზე რჩება.")}</p>
            <p style={{marginBottom: "16px"}} data-edit="t.about.6">{t("დავიწყე ჩემი ნამუშევრების გადაღება სკამიდან, რეალურ ტემპში, და ხალხი ერთსა და იმავე კითხვებს მისვამდა — სად არის აპექსი, როგორ ვაჭერ, რატომ არის ჩემი ფრენჩი თანაბარი. ახლა ამ ვიდეოებს TikTok-ზე 19 000-ზე მეტი ადამიანი უყურებს, ცალკეულ ნამუშევრებს კი 200 000-ზე მეტი ნახვა აქვს.")}</p>
            <p style={{marginBottom: "16px"}} data-edit="t.about.7">{t("წლების განმავლობაში ჩემს სტუდიაში ინდივიდუალურად ვასწავლიდი. ეს აკადემია იგივე გაკვეთილებია, კარგად ჩაწერილი ზემოდან, ქართულად ინგლისური და რუსული სუბტიტრებით — რომ სტუდენტმა ბათუმში ან ბერლინში ზუსტად ის მიიღოს, რასაც ჩემ გვერდით მჯდომი იღებს.")}</p>
            <p style={{color: "var(--ink-soft)", fontSize: ".92rem"}} data-edit="t.about.8">{t("[დაამატეთ: დაწყების წელი, სად ისწავლა, სალონის სახელი, ბრენდები, რომლებთანაც სერტიფიცირებულია.]")}</p>
      
            <ul className="timeline">
              <li data-edit="t.about.9"><b>{t("წელი — დაიწყო ფრჩხილების კეთება")}</b><span>{t("სად და ვისთან ისწავლა.")}</span></li>
              <li data-edit="t.about.10"><b>{t("წელი — გახსნა სტუდია თბილისში")}</b><span>{t("უბანი, ფოკუსი გრძელ ნაშენზე.")}</span></li>
              <li data-edit="t.about.11"><b>{t("2026 — CMC მსოფლიო ჩემპიონატი, პაესტუმი")}</b><span>{t("38-ე მსოფლიო ჩემპიონატი, საქართველოს წარმომადგენელი და Georgia Nails-ის პრეზიდენტი.")}</span></li>
              <li data-edit="t.about.12"><b>{t("წელი — პირველი სტუდენტები")}</b><span>{t("სტუდიაში ინდივიდუალური სწავლება იწყება.")}</span></li>
              <li data-edit="t.about.13"><b>{t("წელი — Tina Robless TikTok-სა და Instagram-ზე")}</b><span>{t("ნამუშევრები 200K+ ნახვას აღწევს; უცხოეთიდან სტუდენტები ონლაინ გაკვეთილებს ითხოვენ.")}</span></li>
              <li data-edit="t.about.14"><b>2026 — Tina Robless Nail Academy</b><span>{t("კურსები ონლაინ გამოდის სერტიფიკატებით.")}</span></li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="cert" style={{padding: "64px 0"}}>
        <div className="wrap">
          <div className="sec-head"><div><h2 data-edit="t.about.15">{t("ბოლო ნამუშევრები")}</h2><p data-edit="t.about.16">{t("სალონური და საკონკურსო ნამუშევრები.")}</p></div><a className="btn-link" href="https://www.instagram.com/tinarobless_/" target="_blank" rel="noopener">{t("მეტი Instagram-ზე")}</a></div>
          <div className="gallery">
            <div className="ph1" data-img="gallery.0"></div><div className="ph4" data-img="gallery.1"></div><div className="ph5" data-img="gallery.2"></div><div className="ph6" data-img="gallery.3"></div><div className="ph7" data-img="gallery.4"></div><div className="ph8" data-img="gallery.5"></div>
          </div>
        </div>
      </section>
      
      <section className="final">
        <div className="wrap">
          <h2 data-edit="t.about.17">{t("ისწავლე ჩემგან.")}</h2>
          <p data-edit="t.about.18">{t("ყველა კურსი ჩემს სტუდიაშია გადაღებული, ნამდვილ კლიენტებზე.")}</p>
          <a className="btn btn-plum" href="/catalog">{t("კურსების ნახვა")}</a>
          <span style={{display: "inline-block", width: "14px"}}></span>
          <a className="btn btn-ghost" href="/certificates">{t("სერტიფიკატების ნახვა")}</a>
        </div>
      </section>
      
    </>
  );
}
