/* Generated from the legacy single-file app: <main data-page="refund">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app, so they are reconnected deliberately rather than guessed at. */
import { getT } from "@/lib/i18n";

export default async function RefundPage() {
  const t = await getT();
  return (
    <>
      
      <section className="lms"><div className="wrap legal">
        <div className="crumbs"><a href="#home">{t("მთავარი")}</a> {t("/ თანხის დაბრუნება")}</div>
        <h1>{t("თანხის დაბრუნების წესები")}</h1>
        <h2>{t("14 დღე ფიქრისთვის")}</h2>
      <p>{t("თუ კურსი შეიძინეთ და პირველი მოდულის დასრულებამდე გადაწყვიტეთ, რომ არ გინდათ, 14 დღის განმავლობაში სრულად დაგიბრუნებთ თანხას. მოგვწერეთ [ელფოსტა]-ზე შეკვეთის ნომრით.")}</p>
      <h2>{t("როდის არ ბრუნდება თანხა")}</h2>
      <p>{t("14 დღის შემდეგ; თუ დასრულებული გაქვთ პირველ მოდულზე მეტი; თუ სერტიფიკატი უკვე გაცემულია; ან თუ ანგარიში წესების დარღვევის გამო შეჩერდა.")}</p>
      <h2>{t("როგორ ხდება დაბრუნება")}</h2>
      <p>{t("თანხა ბრუნდება იმავე მეთოდით, რომლითაც გადაიხადეთ, 5–10 სამუშაო დღეში. სრული პაკეტის შემთხვევაში დაბრუნება ვრცელდება მთელ პაკეტზე.")}</p>
      <h2>{t("ტექნიკური პრობლემა?")}</h2>
      <p>{t("თუ ვიდეო არ იტვირთება ან ფაილი არ იხსნება, ჯერ მოგვწერეთ — ჩვეულებრივ ერთ სამუშაო დღეში ვაგვარებთ.")}</p>
      
      </div></section>
      
    </>
  );
}
