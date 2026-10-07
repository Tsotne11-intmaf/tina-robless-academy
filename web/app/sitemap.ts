import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog-db";

const SITE = "https://www.tinarobless.com";

/* The map a search engine reads instead of guessing.
 *
 * There was none, so every course page had to be found by following links from
 * the front page. The courses come from the catalogue rather than a written
 * list, so a course added from the panel is in the map the moment it exists,
 * and a hidden one is not. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    { path: "", priority: 1 },
    { path: "/catalog", priority: 0.9 },
    { path: "/about", priority: 0.8 },
    { path: "/certificates", priority: 0.7 },
    { path: "/students", priority: 0.7 },
    { path: "/shop", priority: 0.4 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
    { path: "/refund", priority: 0.2 },
  ];

  let courses: { id: string }[] = [];
  try {
    courses = await getCatalog();
  } catch {
    // A sitemap missing its courses is better than a sitemap that fails to build.
  }

  const now = new Date();
  return [
    ...pages.map((p) => ({
      url: `${SITE}${p.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p.priority,
    })),
    ...courses.map((c) => ({
      url: `${SITE}/kurs/${c.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
