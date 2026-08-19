import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
});

export type Locale = (typeof routing.locales)[number];

// Wrappers de las APIs de navegación de Next que respetan el locale activo.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
