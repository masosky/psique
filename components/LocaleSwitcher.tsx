"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, routing, type Locale } from "@/i18n/routing";

// Each language named in itself — a reader looking for their own language
// recognises "Deutsch" far faster than "Alemán".
const LABEL: Record<Locale, string> = {
  es: "Español",
  en: "English",
  ca: "Català",
  pt: "Português",
  fr: "Français",
  it: "Italiano",
  de: "Deutsch",
  ru: "Русский",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("nav");
  const router = useRouter();
  // Without localized `pathnames`, usePathname returns the real route already
  // stripped of the locale prefix (e.g. /tests/big-five) — reusable as is.
  const pathname = usePathname();

  return (
    <label className="relative flex items-center gap-1 rounded-md border border-line bg-card px-2 py-1 text-xs text-muted transition focus-within:border-accent hover:text-fg">
      <span aria-hidden>🌐</span>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value as Locale })}
        className="cursor-pointer appearance-none bg-transparent pr-4 outline-none"
        aria-label={t("language")}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="bg-card text-fg">
            {LABEL[l]}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-2 text-[9px]">
        ▾
      </span>
    </label>
  );
}
