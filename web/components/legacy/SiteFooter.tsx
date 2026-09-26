/* Generated from the legacy <footer>. Interactive bits reconnected separately. */
import { getT } from "@/lib/i18n";

export default async function SiteFooter() {
  const t = await getT();
  return (
    <footer>
      
        <div className="wrap">
          <div className="foot-grid">
            <div><a className="logo" href="/">Tina Robless</a><p style={{maxWidth: "34ch"}}>{t("თინა კუჭუხიზის ონლაინ კურსები — გრძელი ნაშენი, ფრენჩი და დიზაინი, თბილისიდან ყველგან.")}</p></div>
            <div><h4>{t("კურსები")}</h4><ul><li><a href="/catalog">{t("ყველა კურსი")}</a></li><li><a href="/catalog?cat=technique">{t("ტექნიკა")}</a></li><li><a href="/catalog?cat=art">{t("დიზაინი")}</a></li><li><a href="/catalog?cat=business">{t("ბიზნესი")}</a></li></ul></div>
            <div><h4>{t("აკადემია")}</h4><ul><li><a href="/about">{t("ჩემ შესახებ")}</a></li><li><a href="/certificates">{t("სერტიფიკატები")}</a></li><li><a href="/students">{t("წარმატებული სტუდენტები")}</a></li><li><a href="/shop">{t("მაღაზია (მალე)")}</a></li><li><a href="#faq">{t("კითხვები")}</a></li><li><a href="/login">{t("ჩემი კაბინეტი")}</a></li><li><a href="/admin" style={{opacity: ".6"}}>{t("ადმინი")}</a></li></ul></div>
            <div><h4>{t("სამართლებრივი")}</h4><ul><li><a href="/terms">{t("წესები")}</a></li><li><a href="/privacy">{t("კონფიდენციალურობა")}</a></li><li><a href="/refund">{t("თანხის დაბრუნება")}</a></li><li><a href="/privacy">{t("ქუქიები")}</a></li></ul></div>
            <div><h4>{t("გამოგვყევით")}</h4><ul><li><a href="https://www.instagram.com/tinarobless_/" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://www.tiktok.com/@tinarobless" target="_blank" rel="noopener">TikTok</a></li><li><a href="https://www.facebook.com/tiniko.kuchukhidze" target="_blank" rel="noopener">Facebook</a></li><li><a href="https://www.threads.com/@tinarobless_" target="_blank" rel="noopener">Threads</a></li></ul></div>
          </div>
          <div className="foot-bottom"><span>{t("© 2026 Tina Robless Nail Academy · თბილისი, საქართველო ·")} <a href="/terms">{t("წესები")}</a> · <a href="/privacy">{t("კონფიდენციალურობა")}</a> · <a href="/refund">{t("თანხის დაბრუნება")}</a> · <a href="/privacy">{t("ქუქიები")}</a></span><div className="pay"><span>Visa</span><span>Mastercard</span><span>TBC</span><span>BOG</span></div></div>
        </div>
      
    </footer>
  );
}
