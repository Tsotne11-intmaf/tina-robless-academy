import TermsPage from "@/components/legacy/Terms";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("წესები და პირობები") + " \u2014 Tina Robless Nail Academy",
    description: t("საიტითა და კურსებით სარგებლობის წესები."),
  };
}

export default function Page() {
  return <TermsPage />;
}
