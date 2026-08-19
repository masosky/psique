import type { TraitCategory } from "@/lib/traits";

// A Likert-type item (1 = strongly disagree … 5 = strongly agree).
// `loadings` says which traits it scores on and in which direction:
//   +1 → agreeing raises the trait; -1 → reversed item.
// The statement lives in messages/{locale}.json → `tests.<slug>.items.<id>`.
export interface TestItem {
  id: string;
  loadings: Record<string, 1 | -1>;
}

// Reference to the instrument or study the test comes from. Shown on the
// test's page: without it, "personality test" sounds like a horoscope.
export interface TestSource {
  // Short citation: "Goldberg (1992). IPIP Big-Five markers"
  citation: string;
  // Stable link: DOI preferred, otherwise the instrument's page.
  url: string;
  // What this source contributes to the test: "the 5-factor structure",
  // "public-domain item pool"… Translated in messages →
  // `tests.<slug>.sources.<index>`.
  noteKey: string;
}

// Title, tagline, and description live in messages → `tests.<slug>.*`.
export interface TestDefinition {
  slug: string;
  version: number;
  emoji: string;
  category: TraitCategory;
  traits: string[]; // traits it measures (ids from lib/traits.ts)
  minutes: number; // estimated duration
  sources: TestSource[];
  items: TestItem[];
  // Optional transform over the already-normalized scores (0-100).
  // `valores` uses it to ipsatize (center on the person's mean), which is
  // the PVQ correction: it turns absolute agreement into relative priority.
  postprocess?: (scores: Record<string, number>) => Record<string, number>;
}
