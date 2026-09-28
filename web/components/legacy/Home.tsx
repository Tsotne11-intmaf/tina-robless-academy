/* Generated from the legacy single-file app: <main data-page="home">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app, so they are reconnected deliberately rather than guessed at. */
import CourseCard from "@/components/CourseCard";
import { getCatalog, featured } from "@/lib/catalog-db";
import CardSlider from "@/components/CardSlider";
import { getT } from "@/lib/i18n";
import { getContent, editable } from "@/lib/content";

export default async function HomePage() {
  const t = await getT();
  const ed = editable(await getContent(), t);
  const catalog = await getCatalog();
  return (
    <>
      
      
      <section className="hero" id="top">
        <div className="wrap hero-grid">
          <div>
            <p className="ka" data-edit="t.home.1">{ed("t.home.1", "CMC მსოფლიო ჩემპიონი · Georgia Nails-ის პრეზიდენტი · თბილისი")}</p>
            <h1 data-edit="hero.title" data-x="t.home.2">{t("გახადე ფრჩხილები ხელოვნების ნიმუში")}</h1>
            <p className="sub" data-edit="t.home.3">{ed("t.home.3", "5-კვირიანი ონლაინ პროგრამა ამერიკულ ნაშენ სიგრძეზე, არქიტექტურასა და ფრენჩზე — თინა რობლესისგან, თბილისი. უყურეთ ყოველ ნაბიჯს ზემოდან, რეალურ სამუშაო ტემპში, და გადახედეთ იმდენჯერ, რამდენჯერაც დაგჭირდებათ.")}</p>
            <div className="hero-cta">
              <a className="btn btn-plum" href="#flagship">{t("ჩაეწერე მასტერ-პროგრამაზე — 590 ₾")}</a>
              <a className="btn-link" href="/catalog">{t("ყველა კურსი")}</a>
            </div>
            <div className="hero-meta">
              <span>{t("ერთჯერადი გადახდა")}</span>
              <span>{t("მყისიერი წვდომა")}</span>
              <span>{t("უვადო წვდომა")}</span>
              <span> <b>5.0</b> {t("რეიტინგი")}</span>
              <span><b>100%</b> {t("ონლაინ, თქვენს ტემპში")}</span>
              <span>{t("ქართულად · ინგლისური და რუსული სუბტიტრებით")}</span>
            </div>
          </div>
          <div>
            <div className="nails hand" aria-label={t("ხუთი დიზაინი ერთ ხელზე")}>
              <figure className="nail n-pinky"><i className="n-p1" data-img="hero.nails.0"></i><figcaption data-edit="t.home.4">{ed("t.home.4", "ფრენჩი")}</figcaption></figure>
              <figure className="nail n-ring"><i className="n-p2" data-img="hero.nails.1"></i><figcaption data-edit="t.home.5">{ed("t.home.5", "გლიტერი და 3D")}</figcaption></figure>
              <figure className="nail n-middle"><i className="n-p3" data-img="hero.nails.2"></i><figcaption data-edit="t.home.6">{ed("t.home.6", "ინკაფსულაცია")}</figcaption></figure>
              <figure className="nail n-index"><i className="n-p4" data-img="hero.nails.3"></i><figcaption data-edit="t.home.7">{ed("t.home.7", "3D ვარდები")}</figcaption></figure>
              <figure className="nail n-thumb"><i className="n-p5" data-img="hero.nails.4"></i><figcaption data-edit="t.home.8">{ed("t.home.8", "ექსტრემალური სიგრძე")}</figcaption></figure>
            </div>
            <div className="hand-tags"><span>{t("ფრენჩი")}</span><span>{t("გლიტერი და 3D")}</span><span>{t("ინკაფსულაცია")}</span><span>{t("3D ვარდები")}</span><span>{t("ექსტრემალური სიგრძე")}</span></div>
            <p className="hero-caption" data-edit="t.home.9">{ed("t.home.9", "თინას ნამუშევრები · @tinarobless_")}</p>
        </div>
        </div>
      </section>
      
      
      <section id="courses">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 data-edit="t.home.10">{ed("t.home.10", "ყველაზე პოპულარული კურსები")}</h2>
              <p data-edit="t.home.11">{ed("t.home.11", "დაიწყეთ ერთი ტექნიკით ან პირდაპირ სრული პროგრამით. ყველა კურსი გადაღებულია თინას თვალით, ნამდვილ კლიენტზე.")}</p>
            </div>
            <a className="btn-link" href="/catalog">{t("ყველა კურსის ნახვა")}</a>
          </div>
          <CardSlider>
            <div className="cards home-slider">
              {featured(catalog).map((c) => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          </CardSlider>
        </div>
      </section>
      
      
      <section className="why">
        <div className="wrap"><div className="why-line" aria-hidden="true"><i></i></div></div>
        <div className="wrap why-grid">
          <div className="why-item"><h3 data-edit="t.home.24">{ed("t.home.24", "ისწავლეთ თქვენს ტემპში")}</h3><p data-edit="t.home.25">{ed("t.home.25", "ყველა გაკვეთილი ჩაწერილია. გააჩერეთ, შეანელეთ, დაჭერას ათჯერ გადახედეთ.")}</p></div>
          <div className="why-item"><h3 data-edit="t.home.26">{ed("t.home.26", "ასწავლის მოქმედი მასტერი")}</h3><p data-edit="t.home.27">{ed("t.home.27", "გადაღებულია თინას თბილისურ სტუდიაში ნამდვილ კლიენტებზე და არა სავარჯიშო ხელზე.")}</p></div>
          <div className="why-item"><h3 data-edit="t.home.28">{ed("t.home.28", "სერტიფიკატი დასრულებისას")}</h3><p data-edit="t.home.29">{ed("t.home.29", "გამოგზავნეთ საბოლოო ნამუშევარი, მიიღეთ უკუკავშირი და ხელმოწერილი სერტიფიკატი.")}</p></div>
          <div className="why-item"><h3 data-edit="t.home.30">{ed("t.home.30", "უვადო წვდომა")}</h3><p data-edit="t.home.31">{ed("t.home.31", "იყიდეთ ერთხელ. კურსში დამატებული ახალი გაკვეთილები უფასოდ გეკუთვნით.")}</p></div>
        </div>
        <div className="wrap"><div className="why-line why-line-bottom" aria-hidden="true"><i></i></div></div>
      </section>
      
      
      <section id="flagship">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 data-edit="t.home.32">{ed("t.home.32", "მასტერ-პროგრამა")}</h2>
              <p data-edit="t.home.33">{ed("t.home.33", "ორი ნაწილი — პირველი სწორად დაყენებული ფორმიდან გრძელი ნამუშევრების სრულ სალონურ კვირამდე. სტუდენტების უმეტესობა ორივეს გადის.")}</p>
            </div>
          </div>
          <div className="feat">
            <article className="card">
              <div className="thumb ph1"></div>
              <div className="card-body">
                <h3 data-edit="t.home.34"><a href="/kurs/master-1">{t("ნაწილი 1 — ააშენე ფრჩხილი")}</a></h3>
                <p data-edit="t.home.35">{ed("t.home.35", "მომზადება, ფორმები, მოდელირება, აპექსი და C-მოხრა, დაჭერა, ფორმის გამოყვანა, ფრენჩი. 5 მოდული, 22 გაკვეთილი.")}</p>
                <div className="card-foot"><span className="dur">{t("მინ. 5 დღე")}</span><span className="price">590 ₾</span></div>
              </div>
            </article>
            <article className="card">
              <div className="thumb ph7"></div>
              <div className="card-body">
                <h3 data-edit="t.home.36"><a href="/kurs/master-2">{t("ნაწილი 2 — იმუშავე სალონში")}</a></h3>
                <p data-edit="t.home.37">{ed("t.home.37", "კორექცია ექსტრემალურ სიგრძეზე, სამუშაო დროის შემცირება, რთული შემთხვევები, კლიენტის კონსულტაცია. 8 კვირა საშინაო დავალებებით.")}</p>
                <div className="card-foot"><span className="dur">{t("მინ. 8 კვირა")}</span><span className="price">650 ₾</span></div>
              </div>
            </article>
          </div>
          <div className="bundle">
            <div className="thumb ph1"></div>
            <div className="bundle-body">
              <h3 data-edit="t.home.38"><a href="/kurs/bundle">{t("მასტერ-პროგრამა — სრული პაკეტი")}</a></h3>
              <p data-edit="t.home.39">{ed("t.home.39", "ნაწილი 1 და 2 პლუს მათში შემავალი სამი ტექნიკური კურსი, ერთი გადახდით.")}</p>
              <ul>
                <li data-edit="t.home.40">{ed("t.home.40", "ნაწილი 1 და ნაწილი 2")}</li>
                <li data-edit="t.home.41">{ed("t.home.41", "იდეალური ფრენჩი")}</li>
                <li data-edit="t.home.42">{ed("t.home.42", "ექსტრემალური სიგრძე: არქიტექტურა და დაჭერა")}</li>
                <li data-edit="t.home.43">{ed("t.home.43", "ორი ლაივ Q&A ზარი თინასთან")}</li>
                <li data-edit="t.home.44">{ed("t.home.44", "სერტიფიკატი დასრულებისას")}</li>
              </ul>
              <div className="bundle-price"><span className="now">990 ₾</span><span className="was">1,430 ₾</span></div>
              <a className="btn btn-plum" href="/kurs/bundle">{t("სრული პაკეტის ყიდვა")}</a>
            </div>
          </div>
        </div>
      </section>
      
      
      <section id="technique" style={{paddingTop: "0"}}>
        <div className="wrap">
          <div className="sec-head">
            <div><h2 data-edit="t.home.45">{ed("t.home.45", "ტექნიკური კურსები")}</h2><p data-edit="t.home.46">{ed("t.home.46", "გრძელი ფრჩხილების სტრუქტურული უნარები. თითოეული დამოუკიდებელი კურსია.")}</p></div>
            <a className="btn-link" href="/catalog?cat=technique">{t("ყველა ტექნიკური კურსი")}</a>
          </div>
          <CardSlider>
            <div className="cards home-slider">
              {catalog.filter((c) => c.cat === "technique").map((c) => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          </CardSlider>
        </div>
      </section>
      
      
      <section id="nail-art" style={{paddingTop: "0"}}>
        <div className="wrap">
          <div className="sec-head">
            <div><h2 data-edit="t.home.53">{ed("t.home.53", "დიზაინის კურსები")}</h2><p data-edit="t.home.54">{ed("t.home.54", "მოკლე, კონკრეტული გაკვეთილები დიზაინებზე, რომლებსაც კლიენტები ყველაზე ხშირად ითხოვენ.")}</p></div>
            <a className="btn-link" href="/catalog?cat=art">{t("ყველა დიზაინის კურსი")}</a>
          </div>
          <CardSlider>
            <div className="cards home-slider">
              {catalog.filter((c) => c.cat === "art").map((c) => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          </CardSlider>
        </div>
      </section>
      
      
      <section className="about" id="about">
        <div className="wrap about-grid">
          <div className="portrait" data-img="about.portrait" style={{background: "url(/img/img-cb3a67f067.jpg) center/cover", borderColor: "var(--line)"}}></div>
          <div>
            {/* On a phone the tall portrait sat above the section and pushed the
                whole of it down before a word could be read. A small one beside
                the heading says the same thing in a tenth of the height. It
                carries the same picture slot, so replacing the photo replaces
                both. */}
            <div className="about-lead">
              <div
                className="portrait-mini"
                data-img="about.portrait"
                style={{background: "url(/img/img-cb3a67f067.jpg) center/cover"}}
              />
              <div>
                <p className="ka" data-edit="t.home.61">{ed("t.home.61", "თინა კუჭუხიზე · Tina Robless")}</p>
                <h2 data-edit="t.home.62">{ed("t.home.62", "ჩემ შესახებ")}</h2>
              </div>
            </div>
            <p data-edit="t.home.63">{ed("t.home.63", "თინა კუჭუხიზე, ონლაინ ცნობილი როგორც Tina Robless, ფრჩხილების მასტერი და პედაგოგია თბილისიდან. ცნობილია გრძელი ამერიკული ნაშენით, ზუსტი ფრენჩითა და ვარდისფერი ნამუშევრებით, რომლებიც საქართველოს საზღვრებს სცილდება.")}</p>
            <p data-edit="t.home.64">{ed("t.home.64", "მისი სალონიდან გადაღებული ვიდეოები აღწევს აუდიტორიას საქართველოში, ევროპასა და აშშ-ში — 19 000-ზე მეტი გამომწერი TikTok-ზე, ცალკეულ ნამუშევრებს კი 200 000-ზე მეტი ნახვა აქვს. წლების განმავლობაში სტუდენტები სტუდიაში ინდივიდუალურად სწავლობდნენ; ეს აკადემია იმავე გაკვეთილებს ონლაინ გთავაზობთ, ქართულად, ინგლისური და რუსული სუბტიტრებით.")}</p>
            <div className="creds">
              <span>{t("CMC მსოფლიო ჩემპიონი")}</span><span>{t("Georgia Nails-ის პრეზიდენტი")}</span><span>CAT</span><span>{t("ფრჩხილების მასტერი, თბილისი")}</span><span>{t("პედაგოგი")}</span>
            </div>
            <a className="btn btn-plum" href="/about">{t("მეტი ჩემ შესახებ")}</a>
            <div className="socials" style={{marginTop: "30px"}}>
              <a href="https://www.instagram.com/tinarobless_/" target="_blank" rel="noopener">Instagram @tinarobless_</a>
              <a href="https://www.tiktok.com/@tinarobless" target="_blank" rel="noopener">TikTok @tinarobless</a>
              <a href="https://www.facebook.com/tiniko.kuchukhidze" target="_blank" rel="noopener">Facebook</a>
            </div>
          </div>
        </div>
      </section>
      
      
      <section id="students">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 data-edit="t.home.65">{ed("t.home.65", "წარმატებული სტუდენტები")}</h2>
              <p data-edit="t.home.66">{ed("t.home.66", "მასტერები, რომლებმაც თინასთან ისწავლეს და ახლა საკუთარი კლიენტურა ჰყავთ. მათი ნამუშევრები, მათი სიტყვები.")}</p>
            </div>
            <a className="btn-link" href="/students">{t("ყველა კურსდამთავრებული")}</a>
          </div>
          <div className="students-grid">
            <article className="student">
              <div className="work ph9"></div>
              <div className="student-body">
                <h3 data-edit="t.home.67">{ed("t.home.67", "სტუდენტის სახელი")}</h3>
                <div className="where">{t("თბილისი · საკუთარი სტუდია")}</div>
                <p data-edit="t.home.68">{ed("t.home.68", "ერთი წინადადება, სად არის ახლა — მაგ. გახსნა სტუდია ვაკეში, ჩანაწერი ორი კვირით წინ ივსება.")}</p>
                <span className="course">{t("მასტერ-პროგრამა, ნაწილი 1 და 2")}</span>
              </div>
            </article>
            <article className="student">
              <div className="work ph2"></div>
              <div className="student-body">
                <h3 data-edit="t.home.69">{ed("t.home.69", "სტუდენტის სახელი")}</h3>
                <div className="where">{t("ბათუმი · სალონის მასტერი")}</div>
                <p data-edit="t.home.70">{ed("t.home.70", "ერთი წინადადება შედეგზე — მაგ. მოკლე გელიდან XXL ნამუშევრებზე გადავიდა, ფასი გააორმაგა.")}</p>
                <span className="course">{t("ექსტრემალური სიგრძე")}</span>
              </div>
            </article>
            <article className="student">
              <div className="work ph6"></div>
              <div className="student-body">
                <h3 data-edit="t.home.71">{ed("t.home.71", "სტუდენტის სახელი")}</h3>
                <div className="where">{t("ბერლინი · სახლის სტუდია")}</div>
                <p data-edit="t.home.72">{ed("t.home.72", "ერთი წინადადება — მაგ. ონლაინ ისწავლა ქართულად სუბტიტრებით, ახლა გერმანელ კლიენტებთან მუშაობს.")}</p>
                <span className="course">{t("იდეალური ფრენჩი")}</span>
              </div>
            </article>
            <article className="student">
              <div className="work ph8"></div>
              <div className="student-body">
                <h3 data-edit="t.home.73">{ed("t.home.73", "სტუდენტის სახელი")}</h3>
                <div className="where">{t("ქუთაისი · სალონის მასტერი")}</div>
                <p data-edit="t.home.74">{ed("t.home.74", "ერთი წინადადება — მაგ. პირველი კურსი გრძელ ფრჩხილებზე, საბოლოო ნამუშევარი სამ კვირაში ჩააბარა.")}</p>
                <span className="course">{t("ამერიკული ფრჩხილები ფორმებზე")}</span>
              </div>
            </article>
          </div>
          <div className="student-stats">
            <div><b>—</b><span>{t("სერტიფიცირებული კურსდამთავრებული (ჩაწერეთ რეალური რიცხვი)")}</span></div>
            <div><b>—</b><span>{t("ქალაქი, სადაც სტუდენტები მუშაობენ")}</span></div>
            <div><b>—</b><span>{t("კვირა საშუალოდ 1-ლი ნაწილის დასასრულებლად")}</span></div>
          </div>
      
          <div className="sec-head" style={{marginTop: "80px"}}><div><h2 data-edit="t.home.75">{ed("t.home.75", "მათი სიტყვებით")}</h2></div></div>
          <div className="quotes">
            <blockquote className="quote">
              <p data-edit="t.home.76">{ed("t.home.76", "„ორი წელი ვაკეთებდი ფრჩხილებს და გრძელი ნამუშევრები სულ ტყდებოდა. 1-ლი ნაწილის შემდეგ ბოლოს და ბოლოს გავიგე, სად უნდა იყოს აპექსი. მას შემდეგ არაფერი აწეულა.“")}</p>
              <cite data-edit="t.home.77">{ed("t.home.77", "სანიმუშო შეფასება — ჩაანაცვლეთ რეალური სტუდენტით")}</cite>
            </blockquote>
            <blockquote className="quote">
              <p data-edit="t.home.78">{ed("t.home.78", "„მარტო ფრენჩის გაკვეთილი ღირდა. ღიმილის ხაზი ათჯერ გადავხედე და ახლა კლიენტები სახელით ითხოვენ.“")}</p>
              <cite data-edit="t.home.79">{ed("t.home.79", "სანიმუშო შეფასება — ჩაანაცვლეთ რეალური სტუდენტით")}</cite>
            </blockquote>
            <blockquote className="quote">
              <p data-edit="t.home.80">{ed("t.home.80", "„ყოველ ნამუშევარზე თითქმის ერთ საათს ვზოგავ. თინა რეალურ ტემპს აჩვენებს და არა შენელებულ დემოს.“")}</p>
              <cite data-edit="t.home.81">{ed("t.home.81", "სანიმუშო შეფასება — ჩაანაცვლეთ რეალური სტუდენტით")}</cite>
            </blockquote>
          </div>
        </div>
      </section>
      
      
      <section className="cert" id="certificates">
        <div className="wrap cert-grid">
          <div>
            <h2 data-edit="t.home.82">{ed("t.home.82", "მიიღეთ სერტიფიკატი. აჩვენეთ კლიენტებს.")}</h2>
            <p className="lead" style={{marginTop: "14px"}} data-edit="t.home.83">{ed("t.home.83", "დაასრულეთ კურსი, გამოგზავნეთ საბოლოო ნამუშევრის ფოტოები და მიიღეთ თინას მიერ ხელმოწერილი სერტიფიკატი.")}</p>
            <ul>
              <li data-edit="t.home.84">{ed("t.home.84", "პერსონალური სერტიფიკატი თქვენი სახელითა და კურსის საათებით")}</li>
              <li data-edit="t.home.85">{ed("t.home.85", "უკუკავშირი გამოგზავნილ ნამუშევარზე გაცემამდე")}</li>
              <li data-edit="t.home.86">{ed("t.home.86", "გასაზიარებელი Instagram-ზე, TikTok-ზე და ჩაწერის გვერდზე")}</li>
            </ul>
            <a className="btn btn-ghost" href="/certificates" style={{marginTop: "26px"}}>{t("სერტიფიკატის ნახვა")}</a>
          </div>
          <div className="cert-card">
            <small data-edit="t.home.87">{ed("t.home.87", "Tina Robless Nail Academy · თბილისი")}</small>
            <div>{t("დასრულების სერტიფიკატი")}</div>
            <div className="name">{t("სტუდენტის სახელი")}</div>
            <div>{t("გრძელი ფრჩხილების მასტერ-პროგრამა — ნაწილი 1 · 22 გაკვეთილი")}</div>
            <div className="sig">Tina Robless</div>
          </div>
        </div>
      </section>
      
      
      <section className="champ" id="champion">
        <div className="wrap">
          <div className="poster" data-img="poster" role="img" aria-label={t("თინა კუჭუხიზე — CMC მსოფლიო ჩემპიონატის პოსტერი")}></div>
          <div className="txt">
            <div className="gold">{t("CMC · 38-ე მსოფლიო ჩემპიონატი")}</div>
            <h2 data-edit="t.home.88">{ed("t.home.88", "მსოფლიო ჩემპიონი ფრჩხილების დიზაინში")}</h2>
            <p data-edit="t.home.89">{ed("t.home.89", "თინა კუჭუხიზე წარმოადგენს საქართველოს CMC-ის (World Confederation of Coiffure and Aesthetics) მსოფლიო ჩემპიონატზე, როგორც Georgia Nails-ის პრეზიდენტი. ჩემპიონატი ორგანიზებულია CMC-ისა და CAT-ის (Confederazione Artistica e Tecnica della Coiffure e dell'Estetica, იტალია) მიერ.")}</p>
            <p data-edit="t.home.90">{ed("t.home.90", "38-ე მსოფლიო ჩემპიონატი — 25–26 ოქტომბერი 2026, Centro Congressi Ariston, პაესტუმი, იტალია.")}</p>
            <div className="row"><span>CMC World Champion</span><span>President, Georgia Nails</span><span>CAT</span><span>Paestum · Italy · 2026</span></div>
          </div>
        </div>
      </section>
      
      
      <section className="faq" id="faq">
        <div className="wrap" style={{maxWidth: "820px"}}>
          <div className="sec-head"><div><h2 data-edit="t.home.91">{ed("t.home.91", "ხშირად დასმული კითხვები")}</h2></div></div>
          <details><summary data-edit="t.home.92">{ed("t.home.92", "რა ვალუტაშია ფასები?")}</summary><p data-edit="t.home.93">{ed("t.home.93", "ყველა ფასი ქართულ ლარშია (₾). უცხოელი სტუდენტები იმავე თანხას იხდიან, რომელსაც ბარათი კონვერტირებას უკეთებს.")}</p></details>
          <details><summary data-edit="t.home.94">{ed("t.home.94", "რა ენაზეა კურსები?")}</summary><p data-edit="t.home.95">{ed("t.home.95", "თინა ქართულად ასწავლის. ყველა გაკვეთილს აქვს ინგლისური და რუსული სუბტიტრები, ასე რომ უხმოდაც შეგიძლიათ უყუროთ.")}</p></details>
          <details><summary data-edit="t.home.96">{ed("t.home.96", "რამდენ ხანს მაქვს წვდომა?")}</summary><p data-edit="t.home.97">{ed("t.home.97", "უვადოდ. კურსის ყიდვის შემდეგ ის თქვენს კაბინეტში რჩება, მოგვიანებით დამატებული გაკვეთილების ჩათვლით.")}</p></details>
          <details><summary data-edit="t.home.98">{ed("t.home.98", "არის განვადება?")}</summary><p data-edit="t.home.99">{ed("t.home.99", "მასტერ-პროგრამისა და სრული პაკეტის გადახდა ორ ნაწილად შეიძლება. ცალკეული ტექნიკური და დიზაინის კურსები ერთჯერადი გადახდით არის.")}</p></details>
          <details><summary data-edit="t.home.100">{ed("t.home.100", "შედის თუ არა ნაკრები?")}</summary><p data-edit="t.home.101">{ed("t.home.101", "არა. თითოეული კურსის გვერდზე ზუსტად არის ჩამოთვლილი თინას ფორმები, ფუნჯები, ფრეზები და მასალები ბმულებით, რომ თბილისში ან ონლაინ იყიდოთ.")}</p></details>
          <details><summary data-edit="t.home.102">{ed("t.home.102", "შემიძლია დავიწყო, თუ ნაშენი არასდროს გამიკეთებია?")}</summary><p data-edit="t.home.103">{ed("t.home.103", "დიახ. 1-ლი ნაწილი მომზადებითა და ფორმის დაყენებით იწყება. თუ უკვე აშენებთ, დაიწყეთ ექსტრემალური სიგრძით ან მე-2 ნაწილით.")}</p></details>
          <details><summary data-edit="t.home.104">{ed("t.home.104", "მივიღებ სერტიფიკატს?")}</summary><p data-edit="t.home.105">{ed("t.home.105", "დიახ. გამოგზავნეთ საბოლოო ნამუშევრის ფოტოები, მიიღეთ უკუკავშირი და სერტიფიკატი თქვენი სახელითა და კურსის საათებით.")}</p></details>
          <details><summary data-edit="t.home.106">{ed("t.home.106", "თუ ერთი კურსი ვიყიდე, შემიძლია პაკეტზე გადავიდე?")}</summary><p data-edit="t.home.107">{ed("t.home.107", "დიახ. მოგვწერეთ და უკვე გადახდილი თანხა პაკეტის ფასს გამოაკლდება.")}</p></details>
          <details><summary data-edit="t.home.108">{ed("t.home.108", "შემიძლია თინასთან პირადად ჩავეწერო?")}</summary><p data-edit="t.home.109">{ed("t.home.109", "დიახ. სტუდიაში ინდივიდუალური დღეები თბილისში Instagram-ზე ცხადდება; აკადემიის სტუდენტებს პირველებს აქვთ წვდომა.")}</p></details>
        </div>
      </section>
      
      
      <section className="final">
        <div className="wrap">
          <h2 data-edit="t.home.110">{ed("t.home.110", "დაიწყე პირველი გრძელი ნამუშევარი ამ კვირაში.")}</h2>
          <p data-edit="t.home.111">{ed("t.home.111", "აირჩიე კურსი, პირველ გაკვეთილს დღესვე უყურე.")}</p>
          <a className="btn btn-plum" href="/catalog">{t("კურსების ნახვა")}</a>
        </div>
      </section>
      
      
      
    </>
  );
}
