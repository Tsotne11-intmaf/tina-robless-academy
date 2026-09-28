/* Generated from the legacy single-file app: <main data-page="students">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app, so they are reconnected deliberately rather than guessed at. */
import { getT } from "@/lib/i18n";
import { getContent, editable } from "@/lib/content";
import StudentFilters from "@/components/StudentFilters";

export default async function StudentsPage() {
  const t = await getT();
  const ed = editable(await getContent(), t);
  return (
    <>
      
      <div className="page-head">
        <div className="wrap">
          <div className="crumbs"><a href="/">{t("მთავარი")}</a> {t("/ წარმატებული სტუდენტები")}</div>
          <p className="ka" data-edit="t.students.1">{ed("t.students.1", "წარმატებული სტუდენტები")}</p>
          <h1 data-edit="t.students.2">{ed("t.students.2", "წარმატებული სტუდენტები")}</h1>
          <p data-edit="t.students.3">{ed("t.students.3", "მასტერები, რომლებმაც თინასთან ისწავლეს — სტუდიაში და ონლაინ — და ახლა საკუთარი კლიენტურა ჰყავთ. მათი ნამუშევრები, მათი სიტყვები და სად მუშაობენ დღეს.")}</p>
        </div>
      </div>
      
      <section>
        <div className="wrap">
          <StudentFilters allLabel={t("ყველა")} />
      
          <div className="students-grid">
            <article className="student"><div className="work ph9"></div><div className="student-body"><h3 data-edit="t.students.4">{ed("t.students.4", "სტუდენტის სახელი")}</h3><div className="where">{t("თბილისი · საკუთარი სტუდია")}</div><p data-edit="t.students.5">{ed("t.students.5", "სად არის ახლა — მაგ. გახსნა სტუდია ვაკეში, ჩანაწერი ორი კვირით წინ ივსება.")}</p><span className="course" data-edit="t.students.course.1">{ed("t.students.course.1", "მასტერ-პროგრამა, ნაწილი 1 და 2")}</span></div></article>
            <article className="student"><div className="work ph2"></div><div className="student-body"><h3 data-edit="t.students.6">{ed("t.students.6", "სტუდენტის სახელი")}</h3><div className="where">{t("ბათუმი · სალონის მასტერი")}</div><p data-edit="t.students.7">{ed("t.students.7", "შედეგი — მაგ. მოკლე გელიდან XXL ნამუშევრებზე გადავიდა, ფასი გააორმაგა.")}</p><span className="course" data-edit="t.students.course.2">{ed("t.students.course.2", "ექსტრემალური სიგრძე")}</span></div></article>
            <article className="student"><div className="work ph6"></div><div className="student-body"><h3 data-edit="t.students.8">{ed("t.students.8", "სტუდენტის სახელი")}</h3><div className="where">{t("ბერლინი · სახლის სტუდია")}</div><p data-edit="t.students.9">{ed("t.students.9", "ონლაინ ისწავლა ქართულად სუბტიტრებით, ახლა გერმანელ კლიენტებთან მუშაობს.")}</p><span className="course" data-edit="t.students.course.3">{ed("t.students.course.3", "იდეალური ფრენჩი")}</span></div></article>
            <article className="student"><div className="work ph8"></div><div className="student-body"><h3 data-edit="t.students.10">{ed("t.students.10", "სტუდენტის სახელი")}</h3><div className="where">{t("ქუთაისი · სალონის მასტერი")}</div><p data-edit="t.students.11">{ed("t.students.11", "პირველი კურსი გრძელ ფრჩხილებზე, საბოლოო ნამუშევარი სამ კვირაში ჩააბარა.")}</p><span className="course" data-edit="t.students.course.4">{ed("t.students.course.4", "ამერიკული ფრჩხილები ფორმებზე")}</span></div></article>
            <article className="student"><div className="work">{t("სტუდენტის ნამუშევრის ფოტო")}</div><div className="student-body"><h3 data-edit="t.students.12">{ed("t.students.12", "სტუდენტის სახელი")}</h3><div className="where">{t("ქალაქი · პოზიცია")}</div><p data-edit="t.students.13">{ed("t.students.13", "ერთი წინადადება შედეგზე.")}</p><span className="course" data-edit="t.students.course.5">{ed("t.students.course.5", "კურსის სახელი")}</span></div></article>
            <article className="student"><div className="work">{t("სტუდენტის ნამუშევრის ფოტო")}</div><div className="student-body"><h3 data-edit="t.students.14">{ed("t.students.14", "სტუდენტის სახელი")}</h3><div className="where">{t("ქალაქი · პოზიცია")}</div><p data-edit="t.students.15">{ed("t.students.15", "ერთი წინადადება შედეგზე.")}</p><span className="course" data-edit="t.students.course.6">{ed("t.students.course.6", "კურსის სახელი")}</span></div></article>
            <article className="student"><div className="work">{t("სტუდენტის ნამუშევრის ფოტო")}</div><div className="student-body"><h3 data-edit="t.students.16">{ed("t.students.16", "სტუდენტის სახელი")}</h3><div className="where">{t("ქალაქი · პოზიცია")}</div><p data-edit="t.students.17">{ed("t.students.17", "ერთი წინადადება შედეგზე.")}</p><span className="course" data-edit="t.students.course.7">{ed("t.students.course.7", "კურსის სახელი")}</span></div></article>
            <article className="student"><div className="work">{t("სტუდენტის ნამუშევრის ფოტო")}</div><div className="student-body"><h3 data-edit="t.students.18">{ed("t.students.18", "სტუდენტის სახელი")}</h3><div className="where">{t("ქალაქი · პოზიცია")}</div><p data-edit="t.students.19">{ed("t.students.19", "ერთი წინადადება შედეგზე.")}</p><span className="course" data-edit="t.students.course.8">{ed("t.students.course.8", "კურსის სახელი")}</span></div></article>
          </div>
      
          <div className="student-stats">
            <div><b>—</b><span>{t("სერტიფიცირებული კურსდამთავრებული")}</span></div>
            <div><b>—</b><span>{t("ქალაქი, სადაც სტუდენტები მუშაობენ")}</span></div>
            <div><b>—</b><span>{t("კვირა საშუალოდ 1-ლი ნაწილის დასასრულებლად")}</span></div>
          </div>
      
          <div className="sec-head" style={{marginTop: "80px"}}><div><h2 data-edit="t.students.20">{ed("t.students.20", "მათი სიტყვებით")}</h2></div></div>
          <div className="quotes">
            <blockquote className="quote"><p data-edit="t.students.21">{ed("t.students.21", "„ორი წელი ვაკეთებდი ფრჩხილებს და გრძელი ნამუშევრები სულ ტყდებოდა. 1-ლი ნაწილის შემდეგ ბოლოს და ბოლოს გავიგე, სად უნდა იყოს აპექსი. მას შემდეგ არაფერი აწეულა.“")}</p><cite data-edit="t.students.22">{ed("t.students.22", "სანიმუშო შეფასება — ჩაანაცვლეთ რეალური სტუდენტით")}</cite></blockquote>
            <blockquote className="quote"><p data-edit="t.students.23">{ed("t.students.23", "„მარტო ფრენჩის გაკვეთილი ღირდა. ღიმილის ხაზი ათჯერ გადავხედე და ახლა კლიენტები სახელით ითხოვენ.“")}</p><cite data-edit="t.students.24">{ed("t.students.24", "სანიმუშო შეფასება — ჩაანაცვლეთ რეალური სტუდენტით")}</cite></blockquote>
            <blockquote className="quote"><p data-edit="t.students.25">{ed("t.students.25", "„ყოველ ნამუშევარზე თითქმის ერთ საათს ვზოგავ. თინა რეალურ ტემპს აჩვენებს და არა შენელებულ დემოს.“")}</p><cite data-edit="t.students.26">{ed("t.students.26", "სანიმუშო შეფასება — ჩაანაცვლეთ რეალური სტუდენტით")}</cite></blockquote>
          </div>
      
          <div className="submit-box">
            <div>
              <h2 style={{fontSize: "1.8rem"}} data-edit="t.students.27">{ed("t.students.27", "დაამთავრე? მოხვდი გვერდზე.")}</h2>
              <p data-edit="t.students.28">{ed("t.students.28", "გამოგზავნეთ საუკეთესო ნამუშევრის სამი ფოტო, თქვენი ქალაქი და გავლილი კურსი. თინა ყველა განაცხადს განიხილავს და ახალ კურსდამთავრებულებს ყოველთვიურად ამატებს.")}</p>
            </div>
            <div style={{textAlign: "right"}}><a className="btn btn-plum" href="https://www.instagram.com/tinarobless_/" target="_blank" rel="noopener">{t("ნამუშევრის გაგზავნა")}</a></div>
          </div>
        </div>
      </section>
      
    </>
  );
}
