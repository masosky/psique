import { ImageResponse } from "next/og";
import { THEME } from "@/lib/theme";
import { MARK } from "@/lib/brand";

// Apple touch icon: the butterfly mark at 180px. iOS applies its own corner
// mask, so the background bleeds to the edges.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="150" height="150" viewBox={MARK.viewBox}>
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
