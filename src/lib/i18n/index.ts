import { de } from "./locales/de";
import { en } from "./locales/en";
import { es, type Dict } from "./locales/es";
import { fr } from "./locales/fr";
import { it } from "./locales/it";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { pt } from "./locales/pt";
import { zh } from "./locales/zh";

export type { Dict };

export const LOCALES = ["es", "en", "pt", "ko", "ja", "zh", "fr", "de", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_NAMES: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

export const DICTS: Record<Locale, Dict> = { es, en, pt, ko, ja, zh, fr, de, it };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Picks the best supported language from the Accept-Language header. */
export function matchLocale(acceptLanguage: string | null): Locale {
  for (const part of (acceptLanguage ?? "").split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) {
      return code;
    }
  }
  return DEFAULT_LOCALE;
}
