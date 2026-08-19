// ---------------------------------------------------------------------------
// Brand mark: a Rorschach-inkblot butterfly.
//
// The butterfly is the Greek symbol of the psyche (Psyche was depicted with
// butterfly wings), and a symmetric inkblot is the universal image of the
// personality test — one shape, both readings. Path data lives here so the
// nav logo, the favicon, the apple icon, and the Open Graph card all render
// the exact same mark.
// ---------------------------------------------------------------------------

export const BRAND_WORDMARK = "psique";

export const MARK = {
  viewBox: "0 0 64 64",
  // Four wing lobes: large upper pair, small lower pair — the classic
  // butterfly silhouette, kept blobby enough to read as an inkblot.
  wings: [
    "M31 31 C 28 15, 12 7, 7 15 C 3 22, 13 30, 22 31 C 25 31.5, 29 31.5, 31 31 Z",
    "M33 31 C 36 15, 52 7, 57 15 C 61 22, 51 30, 42 31 C 39 31.5, 35 31.5, 33 31 Z",
    "M31 36 C 28 47, 17 54, 11 49 C 6 44, 12 37, 20 35 C 24 34.3, 29 34.8, 31 36 Z",
    "M33 36 C 36 47, 47 54, 53 49 C 58 44, 52 37, 44 35 C 40 34.3, 35 34.8, 33 36 Z",
  ],
  body: { cx: 32, cy: 33, rx: 2.2, ry: 12 },
} as const;
