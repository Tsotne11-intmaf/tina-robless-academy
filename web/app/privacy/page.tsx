import PrivacyPage from "@/components/legacy/Privacy";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("კონფიდენციალურობის პოლიტიკა") + " \u2014 Tina Robless Nail Academy",
    description: t("როგორ ვიწერთ და ვიცავთ თქვენს მონაცემებს."),
  };
}

export default function Page() {
  return <PrivacyPage />;
}
