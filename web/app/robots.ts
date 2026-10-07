import type { MetadataRoute } from "next";

const SITE = "https://www.tinarobless.com";

/* What a crawler may read, and where the map is.
 *
 * There was no robots.txt at all, which blocks nothing but also points nowhere.
 * Google will not show a site's icon beside a result if it cannot fetch it, so
 * the icon being reachable is stated rather than left to be assumed.
 *
 * The cabinet and the admin panel are kept out: they need a session, so a
 * crawler only ever sees the login page, and listing them wastes crawl budget
 * on a small site. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/favicon.ico", "/icon-48.png", "/icon-96.png"],
        disallow: ["/admin", "/dashboard", "/profile", "/hw", "/mycert", "/course/", "/lesson/", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
