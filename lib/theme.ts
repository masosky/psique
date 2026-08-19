// ---------------------------------------------------------------------------
// Single source of truth for the color theme.
//
// To rebrand the app, edit THEME here and you are done:
//  - The root layout injects these values as CSS custom properties on <html>,
//    overriding the defaults declared in globals.css, so every Tailwind
//    utility (bg-accent, text-muted, border-line…) follows this file.
//  - Charts, category colors, the favicon and the Open Graph images import
//    from here directly.
// globals.css keeps a mirrored copy inside @theme only because Tailwind v4
// needs it at build time to generate the utility classes; runtime values
// always come from this file.
// ---------------------------------------------------------------------------

import type { TraitCategory } from "@/lib/traits";

export const THEME = {
  // surfaces, from page background to elevated cards
  ink: "#070d19",
  surface: "#0c1424",
  card: "#101a2e",
  card2: "#162238",
  line: "#22304a",
  // text
  fg: "#e8edf7",
  muted: "#8da0bd",
  // brand accent: trust blue (banks and health apps blue — deliberate for an
  // app that tells you who you are)
  accent: "#60a5fa",
  accentStrong: "#2563eb",
  // semantic extras
  amber: "#fbbf24",
  sky: "#22d3ee",
  good: "#34d399",
  bad: "#f87171",
} as const;

// One color per trait category, used by radars and bars on the profile page.
export const CATEGORY_COLOR: Record<TraitCategory, string> = {
  politica: THEME.sky,
  personalidad: THEME.accent,
  moral: THEME.good,
  valores: "#f472b6",
  vinculos: "#fb7185",
  oscuro: THEME.bad,
  caracter: THEME.amber,
  habilidades: "#2dd4bf",
  humor: "#fb923c",
};

// Political compass third-axis scale: low → warm amber, high → brand blue.
export const COMPASS_SCALE = { from: THEME.amber, to: THEME.accent } as const;

// Line-chart series palette. Category colors can't be reused here: a chart
// often plots several traits from the SAME category, which would draw them in
// one indistinguishable color. These are ordered for maximum separation.
export const SERIES_COLORS = [
  THEME.accent, // blue
  THEME.amber, // amber
  "#2dd4bf", // teal
  "#f472b6", // pink
  THEME.good, // green
  "#fb923c", // orange
] as const;

// CSS custom properties injected on <html> by the root layout. Names must
// match the tokens declared in globals.css @theme.
export function themeCssVars(): Record<string, string> {
  return {
    "--color-ink": THEME.ink,
    "--color-surface": THEME.surface,
    "--color-card": THEME.card,
    "--color-card2": THEME.card2,
    "--color-line": THEME.line,
    "--color-fg": THEME.fg,
    "--color-muted": THEME.muted,
    "--color-accent": THEME.accent,
    "--color-accent-strong": THEME.accentStrong,
    "--color-amber": THEME.amber,
    "--color-sky": THEME.sky,
    "--color-good": THEME.good,
    "--color-bad": THEME.bad,
  };
}
