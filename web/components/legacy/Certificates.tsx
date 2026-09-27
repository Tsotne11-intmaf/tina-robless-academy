/* Generated from the legacy single-file app: <main data-page="certificates">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app (1 dropped), so they are reconnected deliberately rather than guessed at. */
import { getT } from "@/lib/i18n";
import { getContent, editable, listOf } from "@/lib/content";

export default async function CertificatesPage() {
  const t = await getT();
  const content = await getContent();
  const ed = editable(content, t);
  // Entries Tina has added herself, shown after the ones that shipped.
  const extraAwards = listOf(content, "list.awards");
  return (
    <>
      
      <div className="page-head">
        <div className="wrap">
          <div className="crumbs"><a href="/">{t("მთავარი")}</a> {t("/ სერტიფიკატები")}</div>
          <p className="ka" data-edit="t.certificates.1">{ed("t.certificates.1", "სერტიფიკატები")}</p>
          <h1 data-edit="t.certificates.2">{ed("t.certificates.2", "სერტიფიკატები")}</h1>
          <p data-edit="t.certificates.3">{ed("t.certificates.3", "ყველა კურსი სრულდება თინა რობლესის მიერ პირადად ხელმოწერილი სერტიფიკატით. თითოეულს აქვს უნიკალური ნომერი და ამ გვერდზე მოწმდება.")}</p>
          <div className="sub-nav">
            <a href="#sample">{t("სერტიფიკატი")}</a>
            <a href="#by-course">{t("კურსების მიხედვით")}</a>
            <a href="#nominations">{t("ნომინაციები და ჯილდოები")}</a>
            <a href="#official">{t("ოფიციალური ხელმოწერა და შემოწმება")}</a>
          </div>
        </div>
      </div>
      
      
      <section id="sample">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 data-edit="t.certificates.4">{ed("t.certificates.4", "რას იღებთ")}</h2>
              <p data-edit="t.certificates.5">{ed("t.certificates.5", "პერსონალური სერტიფიკატი PDF-ად, თქვენს არჩეულ ენაზე, პლუს ბეჭდური ასლი მოთხოვნით საქართველოში მყოფი სტუდენტებისთვის.")}</p>
            </div>
          </div>
      
          <div className="cert-doc" role="img" aria-label={t("სანიმუშო სერტიფიკატი")}>
            <div className="academy"><span>{t("Tina Robless Nail Academy · თბილისი, საქართველო")}</span><span>No. TRA-2026-0001</span></div>
            <div className="title">{t("დასრულების სერტიფიკატი")}</div>
            <div className="sub">Certificate of Completion</div>
            <div className="line">{t("ეს ადასტურებს, რომ")}</div>
            <div className="name">{t("სტუდენტის სახელი")}</div>
            <div className="line">{t("წარმატებით დაასრულა")}</div>
            <div className="course">{t("გრძელი ფრჩხილების მასტერ-პროგრამა — ნაწილი 1")}</div>
            <div className="hours">{t("22 გაკვეთილი · 40 საათი · საბოლოო ნამუშევარი შემოწმებული და დამტკიცებულია")}</div>
            <div className="bottom">
              <div><div className="field">{t("გაცემის თარიღი")}</div></div>
              <div>
                <div className="seal">Tina Robless<br />Nail Academy<br />{t("თბილისი")}</div>
              </div>
              <div>
                <span className="signature">Tina Robless</span>
                <div className="field">{t("თინა კუჭუხიზე (Tina Robless), დამფუძნებელი და პედაგოგი")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      
      <section id="by-course" style={{paddingTop: "0"}}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 data-edit="t.certificates.6">{ed("t.certificates.6", "სერტიფიკატები კურსების მიხედვით")}</h2>
              <p data-edit="t.certificates.7">{ed("t.certificates.7", "თითოეულ კურსს საკუთარი სერტიფიკატი აქვს — კურსის დასრულებისა და საბოლოო ნამუშევრის შემოწმების შემდეგ.")}</p>
            </div>
          </div>
          <div className="cert-slots">
            <article className="cert-slot"><div className="preview" data-img="cert.1">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.8"><a href="/kurs/master-1">{t("გრძელი ფრჩხილების მასტერ-პროგრამა — ნაწილი 1")}</a></h3><p data-edit="t.certificates.9">{ed("t.certificates.9", "40 საათი · შემოწმებული საბოლოო ნამუშევარი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.2">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.10"><a href="/kurs/master-2">{t("გრძელი ფრჩხილების მასტერ-პროგრამა — ნაწილი 2")}</a></h3><p data-edit="t.certificates.11">{ed("t.certificates.11", "8 კვირა · შემოწმებული სალონური ნამუშევრები")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.3">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.12"><a href="/kurs/bundle">{t("მასტერ-პროგრამა — სრული პაკეტი")}</a></h3><p data-edit="t.certificates.13">{ed("t.certificates.13", "მასტერ-სერტიფიკატი, ორივე ნაწილი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.4">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.14"><a href="/kurs/american">{t("ამერიკული ფრჩხილები ფორმებზე")}</a></h3><p data-edit="t.certificates.15">{ed("t.certificates.15", "8 საათი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.5">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.16"><a href="/kurs/french">{t("იდეალური ფრენჩი")}</a></h3><p data-edit="t.certificates.17">{ed("t.certificates.17", "5 საათი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.6">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.18"><a href="/kurs/extreme">{t("ექსტრემალური სიგრძე: არქიტექტურა და დაჭერა")}</a></h3><p data-edit="t.certificates.19">{ed("t.certificates.19", "6 საათი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.7">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.20"><a href="/kurs/correction">{t("კორექცია გრძელ ფრჩხილებზე")}</a></h3><p data-edit="t.certificates.21">{ed("t.certificates.21", "4 საათი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.8">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.22"><a href="/kurs/crystals">{t("კრისტალები, ჩარმები და 3D")}</a></h3><p data-edit="t.certificates.23">{ed("t.certificates.23", "3 საათი")}</p></div></article>
            <article className="cert-slot"><div className="preview" data-img="cert.9">{t("სერტიფიკატის სურათი")}</div><div className="body"><h3 data-edit="t.certificates.24"><a href="/kurs/chrome">{t("ქრომი და კატის თვალი")}</a></h3><p data-edit="t.certificates.25">{ed("t.certificates.25", "2 საათი")}</p></div></article>
          </div>
        </div>
      </section>
      
      
      <section id="nominations" className="cert">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 data-edit="t.certificates.26">{ed("t.certificates.26", "ნომინაციები და ჯილდოები")}</h2>
              <p data-edit="t.certificates.27">{ed("t.certificates.27", "თინას საკუთარი კვალიფიკაციები, კონკურსების შედეგები და ბრენდების სერტიფიკატები. თითოეულ ჩანაწერს დიპლომის ან ფოტოს ადგილი აქვს.")}</p>
            </div>
          </div>
          <div className="awards" data-list="list.awards">
            <div className="award">
              <div className="year">2026</div>
              <div><h3 data-edit="t.certificates.28">{ed("t.certificates.28", "CMC მსოფლიო ჩემპიონი — 38-ე მსოფლიო ჩემპიონატი")}</h3><p data-edit="t.certificates.29">{ed("t.certificates.29", "World Confederation of Coiffure and Aesthetics (CMC) და CAT (იტალია). Centro Congressi Ariston, პაესტუმი, იტალია, 25–26 ოქტომბერი 2026. საქართველოს წარმომადგენელი — Georgia Nails-ის პრეზიდენტი.")}</p></div>
              <div className="proof ph3" data-img="poster" style={{aspectRatio: "4/5", borderStyle: "solid", borderColor: "var(--line)"}}></div>
            </div>
            <div className="award">
              <div className="year">—</div>
              <div><h3 data-edit="t.certificates.30">{ed("t.certificates.30", "Georgia Nails-ის პრეზიდენტი")}</h3><p data-edit="t.certificates.31">{ed("t.certificates.31", "საქართველოს ფრჩხილების ინდუსტრიის წარმომადგენელი CMC-ის საერთაშორისო ჩემპიონატებზე.")}</p></div>
              <div className="proof" data-img="award.1">{t("დიპლომი / ფოტო")}</div>
            </div>
            <div className="award">
              <div className="year">{t("წელი")}</div>
              <div><h3 data-edit="t.certificates.32">{ed("t.certificates.32", "სხვა კონკურსები და ნომინაციები")}</h3><p data-edit="t.certificates.33">{ed("t.certificates.33", "ღონისძიება, ქვეყანა, ადგილი და კატეგორია.")}</p></div>
              <div className="proof" data-img="award.2">{t("დიპლომი / ფოტო")}</div>
            </div>
            <div className="award">
              <div className="year">{t("წელი")}</div>
              <div><h3 data-edit="t.certificates.34">{ed("t.certificates.34", "პედაგოგის / ტრენერის სტატუსი")}</h3><p data-edit="t.certificates.35">{ed("t.certificates.35", "ბრენდი ან აკადემია, რომელმაც თინას თავისი პროგრამების სწავლების უფლება მისცა.")}</p></div>
              <div className="proof" data-img="award.3">{t("დიპლომი / ფოტო")}</div>
            </div>
            {extraAwards.map((id) => (
              <div className="award" key={id} data-list-item={id}>
                <div className="year" data-edit={`list.awards.${id}.year`}>
                  {ed(`list.awards.${id}.year`, "წელი")}
                </div>
                <div>
                  <h3 data-edit={`list.awards.${id}.title`}>
                    {ed(`list.awards.${id}.title`, "ახალი ჩანაწერი")}
                  </h3>
                  <p data-edit={`list.awards.${id}.text`}>
                    {ed(`list.awards.${id}.text`, "აღწერა")}
                  </p>
                </div>
                <div className="proof" data-img={`list.awards.${id}`}>
                  {t("დიპლომი / ფოტო")}
                </div>
              </div>
            ))}</div>
          </div>
      </section>
      
      
      <section id="official">
        <div className="wrap">
          <div className="official">
            <div>
              <h2 data-edit="t.certificates.36">{ed("t.certificates.36", "ხელმოწერილი და შემოწმებადი")}</h2>
              <p data-edit="t.certificates.37">{ed("t.certificates.37", "ყველა სერტიფიკატს ხელს აწერს თინა კუჭუხიზე (Tina Robless), როგორც აკადემიის დამფუძნებელი და პედაგოგი; მას აქვს აკადემიის ბეჭედი და უნიკალური ნომერი.")}</p>
              <p data-edit="t.certificates.38">{ed("t.certificates.38", "შეიყვანეთ სერტიფიკატის ნომერი, რომ დაადასტუროთ მისი გაცემა აკადემიის მიერ და ნახოთ კურსი და თარიღი.")}</p>
              <form className="verify">
                <input type="text" placeholder={t("მაგ. TRA-2026-0001")} aria-label={t("სერტიფიკატის ნომერი")} />
                <button type="submit">{t("შემოწმება")}</button>
              </form>
            </div>
            <div className="sig-box">
              <span className="signature">Tina Robless</span>
              <div className="field">{t("ოფიციალური ხელმოწერა · თინა კუჭუხიზე · თბილისი, საქართველო")}</div>
              <div className="seal" style={{marginTop: "22px"}}>Tina Robless<br />Nail Academy<br />{t("თბილისი")}</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="final" style={{paddingTop: "20px"}}>
        <div className="wrap">
          <h2 data-edit="t.certificates.39">{ed("t.certificates.39", "მოიპოვე შენი.")}</h2>
          <p data-edit="t.certificates.40">{ed("t.certificates.40", "დაასრულე ნებისმიერი კურსი, გამოგზავნე საბოლოო ნამუშევარი და თინა ხელს მოაწერს.")}</p>
          <a className="btn btn-plum" href="/catalog">{t("კურსების ნახვა")}</a>
        </div>
      </section>
      
    </>
  );
}
