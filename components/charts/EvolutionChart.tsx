"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "next-intl";
import { THEME } from "@/lib/theme";

export interface EvolutionSeries {
  trait: string;
  label: string;
  color: string;
  points: { at: number; score: number }[];
}

/**
 * One line per trait over real time. Each series has its own timestamps (tests
 * are retaken on different days), so the x axis is numeric and gaps are
 * bridged with connectNulls instead of forcing a shared grid of dates.
 */
export function EvolutionChart({
  series,
  height = 300,
}: {
  series: EvolutionSeries[];
  height?: number;
}) {
  const locale = useLocale();
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  const timestamps = [...new Set(series.flatMap((s) => s.points.map((p) => p.at)))].sort(
    (a, b) => a - b,
  );
  const data = timestamps.map((at) => {
    const row: Record<string, number | null> = { at };
    for (const s of series) {
      row[s.trait] = s.points.find((p) => p.at === at)?.score ?? null;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
        <CartesianGrid stroke={THEME.line} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="at"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v: number) => fmt.format(new Date(v))}
          tick={{ fill: THEME.muted, fontSize: 11 }}
          stroke={THEME.line}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: THEME.muted, fontSize: 11 }}
          stroke={THEME.line}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: THEME.card,
            border: `1px solid ${THEME.line}`,
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: THEME.muted }}
          labelFormatter={(v) => fmt.format(new Date(Number(v)))}
          formatter={(value: any, key: any) => [
            Math.round(Number(value) || 0),
            series.find((s) => s.trait === key)?.label ?? String(key),
          ]}
        />
        {series.map((s) => (
          <Line
            key={s.trait}
            type="monotone"
            dataKey={s.trait}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3, fill: s.color }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
