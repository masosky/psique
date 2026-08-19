import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { THEME } from "@/lib/theme";
import { BRAND_WORDMARK, MARK } from "@/lib/brand";
import { loadSharedResult } from "@/lib/share";

// The link preview is the whole growth loop: when someone pastes their result
// into WhatsApp or X, the card has to show THEIR archetype, not a generic one.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ShareOgImage({
  params,
}: {
  params: Promise<{ locale: string; shareId: string }>;
}) {
  const { locale, shareId } = await params;
  const [t, ta, shared] = await Promise.all([
    getTranslations({ locale, namespace: "share" }),
    getTranslations({ locale, namespace: "archetypes" }),
    loadSharedResult(shareId),
  ]);

  // Headline archetype, in order of how much it says about a person. Politics
  // only appears when its separate consent was given.
  const headline = shared?.political
    ? {
        label: t("labelPolitical"),
        value: shared.political.traditional
          ? ta("traditionalSuffix", { name: ta(`political.${shared.political.key}.name`) })
          : ta(`political.${shared.political.key}.name`),
      }
    : shared?.attachment
      ? { label: t("labelAttachment"), value: ta(`attachment.${shared.attachment.key}.name`) }
      : shared?.dark
        ? { label: t("labelDarkShort"), value: ta(`dark.${shared.dark.tier}.name`) }
        : shared?.esteem
          ? { label: t("labelEsteemShort"), value: ta(`autoestima.${shared.esteem.tier}.name`) }
          : null;

  const subtitle = shared
    ? shared.name
      ? t("titleNamed", { name: shared.name })
      : t("title")
    : t("metaTitle");

  return new ImageResponse(
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
        padding: 64,
      }}
    >
      <svg width="76" height="76" viewBox={MARK.viewBox} style={{ marginBottom: 20 }}>
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

      <div style={{ fontSize: 30, color: THEME.muted, marginBottom: 8 }}>{subtitle}</div>

      {headline && (
        // A real element, not a fragment: satori lays fragment children out
        // in a row, which would put the label beside the value.
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: THEME.accent,
            }}
          >
            {headline.label}
          </div>
          <div
            style={{
              // Long archetype names ("Libertario de izquierdas") need to
              // step down a size or they run off the card.
              fontSize: headline.value.length > 18 ? 62 : 78,
              fontWeight: 700,
              letterSpacing: -2,
              textAlign: "center",
              marginTop: 6,
              maxWidth: 1000,
              lineHeight: 1.1,
            }}
          >
            {headline.value}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          marginTop: 40,
          padding: "12px 28px",
          borderRadius: 14,
          border: `2px solid ${THEME.line}`,
          background: `${THEME.card}cc`,
          color: THEME.accent,
          fontSize: 26,
        }}
      >
        {BRAND_WORDMARK}
      </div>
    </div>,
    size,
  );
}
