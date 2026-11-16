"use server";

import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/locale";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocale(locale: string) {
  if (typeof locale !== "string" || !isLocale(locale)) {
    return;
  }
  (await cookies()).set(LOCALE_COOKIE, locale, { maxAge: ONE_YEAR, path: "/", sameSite: "lax", secure: true });
}
