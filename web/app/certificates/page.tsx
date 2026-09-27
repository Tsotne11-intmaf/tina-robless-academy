import CertificatesPage from "@/components/legacy/Certificates";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("სერტიფიკატები") + " \u2014 Tina Robless Nail Academy",
    description: t("კურსის დასრულების სერტიფიკატი და დიპლომები."),
  };
}

export default function Page() {
  return <CertificatesPage />;
}
