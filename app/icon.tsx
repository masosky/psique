import { ImageResponse } from "next/og";
import { THEME } from "@/lib/theme";
import { MARK } from "@/lib/brand";

// Favicon: the Rorschach-butterfly brand mark on the theme's navy ink.
// Drawn from lib/brand.ts so it always matches the nav logo and OG card.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: THEME.ink,
          borderRadius: 7,
        }}
      >
        <svg width="28" height="28" viewBox={MARK.viewBox}>
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
      </div>
    ),
    size,
  );
}
