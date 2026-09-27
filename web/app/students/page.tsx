import StudentsPage from "@/components/legacy/Students";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("სტუდენტების ნამუშევრები") + " \u2014 Tina Robless Nail Academy",
    description: t("რა შეუძლიათ კურსის დასრულების შემდეგ — რეალური ნამუშევრები."),
  };
}

export default function Page() {
  return <StudentsPage />;
}
