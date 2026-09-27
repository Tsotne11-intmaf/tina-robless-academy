import RefundPage from "@/components/legacy/Refund";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("დაბრუნების პოლიტიკა") + " \u2014 Tina Robless Nail Academy",
    description: t("თანხის დაბრუნებისა და კურსზე წვდომის წესები."),
  };
}

export default function Page() {
  return <RefundPage />;
}
