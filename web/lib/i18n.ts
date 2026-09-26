import { cookies } from "next/headers";
import { DICT } from "@/lib/dict";

export const LANGS = ["ka", "en", "ru", "el"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_COOKIE = "tr_lang";

/* DICT maps a Georgian string to [en, ru, el]. Georgian is the source language, so
   there is no entry for it and none is needed. */
const IDX: Record<Exclude<Lang, "ka">, number> = { en: 0, ru: 1, el: 2 };

const GEORGIAN = /[Ⴀ-ჿ]/;

/* Word-boundary-aware substring replacement.

   The legacy translator did a plain split/join for every dictionary key, and because
   DICT contains very short entries - "და" (and) and "ენა" (language) - those were
   replaced inside longer words: "დაჭერით" became "and ჭერით" and "შენახვა" became
   "შLanguageხვა". A key is only replaced here when it is not flanked by Georgian
   letters. Regexes are cached because this runs on every string of every page. */
const rxCache = new Map<string, RegExp>();
function rxFor(key: string) {
  let r = rxCache.get(key);
  if (!r) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    r = new RegExp("(^|[^\\u10A0-\\u10FF])" + escaped + "(?![\\u10A0-\\u10FF])", "g");
    rxCache.set(key, r);
  }
  return r;
}

// Longest first, so a phrase wins over a word it contains.
let sortedKeys: string[] | null = null;
function keys() {
  if (!sortedKeys) sortedKeys = Object.keys(DICT).sort((a, b) => b.length - a.length);
  return sortedKeys;
}

export function translate(text: string, lang: Lang): string {
  if (lang === "ka" || !text) return text;
  const i = IDX[lang];
  const trimmed = text.trim();

  // Exact match first: the common case, and it avoids any substring work.
  const exact = DICT[trimmed];
  if (exact && exact[i]) return text.replace(trimmed, exact[i]);

  if (!GEORGIAN.test(text)) return text;

  let out = text;
  for (const key of keys()) {
    if (out.indexOf(key) === -1) continue;
    const value = DICT[key]?.[i];
    if (!value) continue;
    out = out.replace(rxFor(key), "$1" + value.replace(/\$/g, "$$$$"));
  }
  return out;
}

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value as Lang | undefined;
  return v && (LANGS as readonly string[]).includes(v) ? v : "ka";
}

/* Returns a translator bound to the current request's language, so a server
   component can call t("...") without threading the language through props. */
export async function getT() {
  const lang = await getLang();
  return (text: string) => translate(text, lang);
}
