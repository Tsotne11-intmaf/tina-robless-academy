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
