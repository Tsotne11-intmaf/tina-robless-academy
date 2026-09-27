import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/legacy/SiteHeader";
import SiteFooter from "@/components/legacy/SiteFooter";
import EditBar from "@/components/EditBar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tina Robless Nail Academy — ფრჩხილების სწავლის ტექნიკა იწყება აქ",
  description:
    "თინა რობლესის (თინა კუჭუხიზე) ონლაინ კურსები გრძელ ნაშენზე, ფრენჩსა და დიზაინზე, თბილისი.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* Fonts stay as a stylesheet link rather than next/font: the legacy design depends on
   specific optical-size and weight axes of Fraunces plus the Noto Georgian families,
   and this is the exact request the current site is already proven to render with. */
/* The edit bar is rendered only for an admin, so it is not merely hidden from
   everyone else - it is never sent. The API behind it checks again on every save,
   because markup that is absent is not a permission. */
async function isAdmin() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.rpc("is_admin");
    return data === true;
  } catch {
    return false;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <html lang="ka">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Noto+Serif+Georgian:wght@300;400;500&family=Noto+Sans+Georgian:wght@400;500;600&family=Noto+Serif:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Sans:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        {admin ? <EditBar /> : null}
      </body>
    </html>
  );
}
