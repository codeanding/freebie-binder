"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className={`relative inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-card pr-2.5 pl-3 text-sm transition hover:border-ink/30 ${pending ? "opacity-60" : ""}`}>
      <Languages className="size-4 text-ink-soft" aria-hidden />
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            await setLocale(e.target.value);
            router.refresh();
          })
        }
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
        ))}
      </select>
      <span className="max-w-24 truncate">{LOCALE_NAMES[locale]}</span>
      <ChevronDown className="size-3.5 text-ink-soft" aria-hidden />
    </label>
  );
}
