import ShopPage from "@/components/legacy/Shop";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("მაღაზია") + " \u2014 Tina Robless Nail Academy",
    description: t("მასალები და ინსტრუმენტები — მალე გაიხსნება."),
  };
}

export default function Page() {
  return <ShopPage />;
}
