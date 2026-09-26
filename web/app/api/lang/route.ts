import { NextResponse } from "next/server";
import { LANGS, LANG_COOKIE, type Lang } from "@/lib/i18n";

/* The chosen language is a cookie rather than a URL segment, so every page can stay
   server-rendered and read it per request without duplicating 18 routes per locale. */
export async function POST(request: Request) {
  const { lang } = await request.json();
  if (!(LANGS as readonly string[]).includes(lang)) {
    return NextResponse.json({ error: "unknown language" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, lang: lang as Lang });
  res.cookies.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
