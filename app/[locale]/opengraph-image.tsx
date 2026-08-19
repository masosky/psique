import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { THEME } from "@/lib/theme";
import { BRAND_WORDMARK, MARK } from "@/lib/brand";
import { TESTS } from "@/lib/tests";
import { TRAIT_IDS } from "@/lib/traits";
import { INSIGHT_COUNT } from "@/lib/insights";

// Localized Open Graph card (1200×630) for link previews on social networks
// and messaging apps. Rendered from the theme, so a rebrand updates it too.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const th = await getTranslations({ locale, namespace: "home" });

  const stats = [
    `${TESTS.length} ${th("statTests")}`,
    `${TRAIT_IDS.length} ${th("statTraits")}`,
    `${INSIGHT_COUNT} ${th("statInsights")}`,
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: THEME.ink,
          backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -10%, ${THEME.accentStrong}40, transparent)`,
          color: THEME.fg,
        }}
      >
        {/* butterfly brand mark */}
        <svg width="128" height="128" viewBox={MARK.viewBox} style={{ marginBottom: 24 }}>
          {MARK.wings.map((d) => (
            <path key={d} d={d} fill={THEME.accent} />
          ))}
          <ellipse
            cx={MARK.body.cx}
            cy={MARK.body.cy}
            rx={MARK.body.rx}
            ry={MARK.body.ry}
            fill={THEME.accent}
          />
        </svg>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3 }}>{BRAND_WORDMARK}</div>
        <div style={{ fontSize: 38, color: THEME.muted, marginTop: 12 }}>{t("tagline")}</div>
        <div style={{ display: "flex", gap: 40, marginTop: 48, fontSize: 28 }}>
          {stats.map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: 14,
                border: `2px solid ${THEME.line}`,
                background: `${THEME.card}cc`,
                color: THEME.accent,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
