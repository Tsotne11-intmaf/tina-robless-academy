import AboutPage from "@/components/legacy/About";

import { getT } from "@/lib/i18n";
export async function generateMetadata() {
  const t = await getT();
  return {
    title: t("ჩემ შესახებ") + " — Tina Robless Nail Academy",
    description: t("თინა კუჭუხიზე — ფრჩხილების მასტერი და პედაგოგი თბილისიდან, ონლაინ ცნობილი როგორც Tina Robless."),
  };
}

export default function Page() {
  return <AboutPage />;
}
