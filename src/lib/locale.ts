import "server-only";
import { cookies, headers } from "next/headers";
import { DICTS, isLocale, matchLocale, type Locale } from "./i18n";

export const LOCALE_COOKIE = "lang";

export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) {
    return fromCookie;
  }
  return matchLocale((await headers()).get("accept-language"));
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: DICTS[locale] };
}
