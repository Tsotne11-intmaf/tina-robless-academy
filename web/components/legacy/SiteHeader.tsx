/* Generated from the legacy <header>. Interactive bits reconnected separately. */
import { getT, getLang } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";

export default async function SiteHeader() {
  const t = await getT();
  const lang = await getLang();
  return (
    <header>
      
        <div className="wrap nav">
          <a className="logo" href="/">Tina <span>Robless</span></a>
          <ul>
            <li><a href="/catalog" data-nav="catalog">{t("კურსები")}</a></li>
            <li><a href="/certificates" data-nav="certificates">{t("სერტიფიკატები")}</a></li>
            <li><a href="/students" data-nav="students">{t("სტუდენტები")}</a></li>
            <li><a href="/about" data-nav="about">{t("ჩემ შესახებ")}</a></li>
            <li><a href="/shop" data-nav="shop">{t("მაღაზია")} <span className="soon-tag">{t("მალე")}</span></a></li>
            <li className="m-only"><a href="/login">{t("ჩემი კაბინეტი")}</a></li>
            <li className="m-only"><a className="btn btn-plum" href="/catalog">{t("კურსების ნახვა")}</a></li>
            
            <li className="m-only lang-li"><LangSwitcher current={lang} /></li>
          </ul>
          <div className="nav-right">
            <LangSwitcher current={lang} />
            <a href="/login" style={{fontWeight: "500"}}>{t("ჩემი კაბინეტი")}</a>
            <a className="btn btn-plum" href="/catalog">{t("კურსების ნახვა")}</a>
            <button className="menu-btn" aria-label={t("მენიუს გახსნა")}>☰</button>
          </div>
        </div>
      
    </header>
  );
}
