"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { COMPASS_SCALE } from "@/lib/theme";

const AXES = ["econ", "auth", "cult", "glob", "eco", "rel"] as const;
type Axis = (typeof AXES)[number];

// Color encodes the 3rd dimension: low → warm, high → brand blue. That makes
// the compass genuinely 3D without WebGL or rotating anything.
const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const SCALE_FROM = hexRgb(COMPASS_SCALE.from);
const SCALE_TO = hexRgb(COMPASS_SCALE.to);

function depthColor(v: number, alpha: number) {
  const t = Math.min(1, Math.max(0, v / 100));
  const [r, g, b] = SCALE_FROM.map((f, i) => Math.round(f + (SCALE_TO[i] - f) * t));
  return `rgba(${r},${g},${b},${alpha})`;
}

export function Compass({
  profile,
  cloud,
}: {
  profile: Record<string, number>;
  cloud: { econ: number; auth: number; cult: number }[];
}) {
  const t = useTranslations("compass");
  const tr = useTranslations("traits");

  const available = AXES.filter((a) => profile[a] !== undefined);
  const [xAxis, setXAxis] = useState<Axis>(available.includes("econ") ? "econ" : available[0]);
  const [yAxis, setYAxis] = useState<Axis>(available.includes("auth") ? "auth" : available[1]);
  const [zAxis, setZAxis] = useState<Axis>(available.includes("cult") ? "cult" : available[2]);

  const x = profile[xAxis];
  const y = profile[yAxis];
  const z = profile[zAxis];

  // La nube solo trae econ/auth/cult; si el usuario cambia a otros ejes,
  // se oculta en vez de mentir.
  const cloudAxes = new Set(["econ", "auth", "cult"]);
  const showCloud = cloudAxes.has(xAxis) && cloudAxes.has(yAxis) && cloudAxes.has(zAxis);
  type CloudAxis = "econ" | "auth" | "cult";

  const S = 100; // viewBox

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {(
          [
            [t("axisX"), xAxis, setXAxis],
            [t("axisY"), yAxis, setYAxis],
            [t("color"), zAxis, setZAxis],
          ] as const
        ).map(([label, value, setter]) => (
          <label key={label} className="flex items-center gap-1.5 text-muted">
            {label}
            <select
              value={value}
              onChange={(e) => setter(e.target.value as Axis)}
              className="rounded-md border border-line bg-card px-2 py-1 text-fg outline-none focus:border-accent"
            >
              {available.map((a) => (
                <option key={a} value={a}>
                  {tr(`${a}.short`)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="relative aspect-square w-full">
        <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full">
          <rect x="0" y="0" width={S} height={S} fill="#10141f" rx="2" />
          <g stroke="#262e44" strokeWidth="0.3">
            {[25, 50, 75].map((p) => (
              <g key={p}>
                <line x1={p} y1="0" x2={p} y2={S} />
                <line x1="0" y1={p} x2={S} y2={p} />
              </g>
            ))}
          </g>
          <g stroke="#3b456a" strokeWidth="0.6">
            <line x1="50" y1="0" x2="50" y2={S} />
            <line x1="0" y1="50" x2={S} y2="50" />
          </g>

          {/* comunidad */}
          {showCloud &&
            cloud.map((p, i) => (
              <circle
                key={i}
                cx={p[xAxis as CloudAxis]}
                cy={100 - p[yAxis as CloudAxis]}
                r="1.1"
                fill={depthColor(p[zAxis as CloudAxis], 0.32)}
              />
            ))}

          {/* tú */}
          <circle cx={x} cy={100 - y} r="4.5" fill={depthColor(z, 0.25)} />
          <circle
            cx={x}
            cy={100 - y}
            r="2.4"
            fill={depthColor(z, 1)}
            stroke="#e9ebf5"
            strokeWidth="0.7"
          />
        </svg>

        {/* etiquetas de polos */}
        <span className="absolute top-1/2 left-1 -translate-y-1/2 text-[10px] text-muted">
          {tr(`${xAxis}.low`)}
        </span>
        <span className="absolute top-1/2 right-1 -translate-y-1/2 text-[10px] text-muted">
          {tr(`${xAxis}.high`)}
        </span>
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted">
          {tr(`${yAxis}.high`)}
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted">
          {tr(`${yAxis}.low`)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-10 rounded-full"
            style={{
              background: `linear-gradient(to right, ${COMPASS_SCALE.from}, ${COMPASS_SCALE.to})`,
            }}
          />
          {tr(`${zAxis}.short`)}: {tr(`${zAxis}.low`)} → {tr(`${zAxis}.high`)}
        </span>
        <span>{showCloud ? t("community", { count: cloud.length }) : t("cloudUnavailable")}</span>
      </div>
    </div>
  );
}
