"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { THEME } from "@/lib/theme";

export function RadarBlock({
  data,
  color,
  height = 280,
}: {
  data: { axis: string; value: number }[];
  color: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={THEME.line} />
        <PolarAngleAxis dataKey="axis" tick={{ fill: THEME.muted, fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.25}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
