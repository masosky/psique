import type { TestDefinition } from "./types";
import { clamp } from "@/lib/utils";

// Schwartz's basic values: 10 universal values arranged in a circle with
// tensions (openness to change vs conservation, self-transcendence vs
// self-enhancement). Adapted PVQ format. 20 items, 2 per value.
// Statements in messages/{locale}.json → tests.valores.items
//
// The PVQ carries no reversed items; Schwartz's standard correction is to
// ipsatize: center each value on the person's mean. That way "agreeing with
// everything" (acquiescence) doesn't inflate the profile — it scores what
// you PRIORITIZE, not how much you nod along. 50 = your own mean; >50 =
// above it.
const ipsatize = (scores: Record<string, number>): Record<string, number> => {
  const vals = Object.values(scores);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Object.fromEntries(
    Object.entries(scores).map(([trait, v]) => [trait, clamp(Math.round(50 + v - mean))]),
  );
};

export const valores: TestDefinition = {
  slug: "valores",
  version: 1,
  emoji: "💎",
  category: "valores",
  traits: [
    "selfdir",
    "stimul",
    "hedon",
    "achieve",
    "power",
    "security",
    "conform",
    "tradition",
    "benev",
    "univers",
  ],
  minutes: 4,
  sources: [
    {
      citation: "Schwartz (1992). Advances in Experimental Social Psychology, 25, 1–65",
      url: "https://doi.org/10.1016/S0065-2601(08)60281-6",
      noteKey: "0",
    },
    {
      citation: "Schwartz et al. (2001). PVQ. J. Cross-Cultural Psychology, 32(5), 519–542",
      url: "https://doi.org/10.1177/0022022101032005001",
      noteKey: "1",
    },
    {
      citation: "European Social Survey — Human Values Scale",
      url: "https://www.europeansocialsurvey.org/methodology/ess-methodology/source-questionnaire",
      noteKey: "2",
    },
  ],
  items: [
    { id: "sd1", loadings: { selfdir: 1 } },
    { id: "sd2", loadings: { selfdir: 1 } },
    { id: "st1", loadings: { stimul: 1 } },
    { id: "st2", loadings: { stimul: 1 } },
    { id: "he1", loadings: { hedon: 1 } },
    { id: "he2", loadings: { hedon: 1 } },
    { id: "ac1", loadings: { achieve: 1 } },
    { id: "ac2", loadings: { achieve: 1 } },
    { id: "po1", loadings: { power: 1 } },
    { id: "po2", loadings: { power: 1 } },
    { id: "se1", loadings: { security: 1 } },
    { id: "se2", loadings: { security: 1 } },
    { id: "cf1", loadings: { conform: 1 } },
    { id: "cf2", loadings: { conform: 1 } },
    { id: "tr1", loadings: { tradition: 1 } },
    { id: "tr2", loadings: { tradition: 1 } },
    { id: "be1", loadings: { benev: 1 } },
    { id: "be2", loadings: { benev: 1 } },
    { id: "un1", loadings: { univers: 1 } },
    { id: "un2", loadings: { univers: 1 } },
  ],
  postprocess: ipsatize,
};
