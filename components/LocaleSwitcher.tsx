"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, routing, type Locale } from "@/i18n/routing";

const LABEL: Record<Locale, string> = { es: "ES", en: "EN" };

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  // Sin `pathnames` localizados, usePathname devuelve la ruta real ya sin
  // prefijo de locale (ej. /tests/big-five) — se puede reusar tal cual.
  const pathname = usePathname();

  return (
    <div className="flex items-center rounded-md border border-line text-xs">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => l !== locale && router.replace(pathname, { locale: l })}
          className={`px-2 py-1 transition first:rounded-l-md last:rounded-r-md ${
            l === locale ? "bg-card2 text-fg" : "text-muted hover:text-fg"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
