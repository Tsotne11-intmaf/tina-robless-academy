import UnsubscribeBox from "@/components/UnsubscribeBox";

export const metadata = {
  title: "გამოწერის გაუქმება — Tina Robless Nail Academy",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  return (
    <section className="lms">
      <div className="wrap">
        {t ? (
          <UnsubscribeBox token={t} />
        ) : (
          <div className="login-box">
            <h1>ბმული არასრულია</h1>
            <p>გამოწერის გასაუქმებლად გახსენით ბმული პირდაპირ მიღებული წერილიდან.</p>
          </div>
        )}
      </div>
    </section>
  );
}
