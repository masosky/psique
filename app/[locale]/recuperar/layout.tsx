import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";

// The page itself is a client component, so metadata lives in this layout.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("resetTitle"),
    robots: { index: false, follow: false },
    alternates: localeAlternates(locale, "/recuperar"),
  };
}

export default function RecuperarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
