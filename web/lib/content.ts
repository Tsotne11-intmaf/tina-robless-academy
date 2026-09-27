import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Content = Record<string, string>;

/* Text the owner has changed, keyed by the hooks the original site already had.

   Wrapped in cache() so a page that renders the header, the body and the footer
   fetches this once rather than three times - they are separate components but
   one request.

   A failure here returns an empty map on purpose. The wording that ships in the
   code is a complete, correct copy of the site; if the database is unreachable
   the page should still render it rather than collapse. */
export const getContent = cache(async (): Promise<Content> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("content").select("key,value");
    if (error || !data) return {};
    const out: Content = {};
    for (const row of data) out[row.key as string] = row.value as string;
    return out;
  } catch {
    return {};
  }
});

/* Returns the reader used at every editable spot on the page.

   The override is Georgian, the same as the source, so it goes through the
   translator exactly as the built-in wording does. A phrase the owner writes
   herself has no dictionary entry, so it stays Georgian in the other three
   languages - which is the honest outcome, and better than showing nothing. */
export function editable(content: Content, t: (s: string) => string) {
  return (key: string, fallback: string) => t(content[key] ?? fallback);
}

/* Pictures are applied as one stylesheet rather than per element.

   Every picture slot on the site is already marked with its key, so a single
   rule per replaced image does the whole job - no component has to be rewritten
   to accept a background, and a slot that has never been replaced keeps exactly
   the styling it shipped with. Keys are stored as img.<slot>. */
export function imageCss(content: Content): string {
  const rules: string[] = [];
  for (const [key, url] of Object.entries(content)) {
    if (!key.startsWith("img.")) continue;
    const slot = key.slice(4);
    // The slot name comes from our own markup, but the value is a stored string:
    // anything that could close the declaration or start a new one is refused.
    if (!/^[\w.-]+$/.test(slot)) continue;
    if (!/^https:\/\/[^"'()\s;{}]+$/.test(url)) continue;
    rules.push(
      `[data-img="${slot}"]{background:url("${url}") center/cover !important;color:transparent !important}`
    );
  }
  return rules.join("");
}

/* A list the owner can grow: the timeline of awards, and anything like it.

   The list row itself holds only ids, in order. Each entry's wording lives in
   ordinary content keys - list.awards.a3.title and so on - so a new entry is
   edited, translated and saved by exactly the same machinery as text that
   shipped in the code. Adding an entry is appending an id; removing one is
   dropping it. Nothing has to know the shape of an award. */
export function listOf(content: Content, key: string): string[] {
  const raw = content[key];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
