import type { TestDefinition } from "./types";

// Moral Foundations Theory (Haidt & Graham): 6 bases people build their
// morality on. It's the best psychological predictor of political ideology
// there is, so it cross-references brutally well with the political spectrum.
// 18 items, 3 per foundation.
// Statements in messages/{locale}.json → tests.moral.items
export const moral: TestDefinition = {
  slug: "moral",
  version: 1,
  emoji: "⚖️",
  category: "moral",
  traits: ["care", "fairness", "loyalty", "authority", "purity", "liberty"],
  minutes: 4,
  sources: [
    {
      citation: "Graham, Haidt & Nosek (2009). JPSP, 96(5), 1029–1046",
      url: "https://doi.org/10.1037/a0015141",
      noteKey: "0",
    },
    {
      citation: "Graham et al. (2011). Mapping the moral domain. JPSP, 101(2), 366–385",
      url: "https://doi.org/10.1037/a0021847",
      noteKey: "1",
    },
    {
      citation: "Iyer et al. (2012). Libertarian morality. PLoS ONE, 7(8), e42366",
      url: "https://doi.org/10.1371/journal.pone.0042366",
      noteKey: "2",
    },
  ],
  items: [
    { id: "ca1", loadings: { care: 1 } },
    { id: "ca2", loadings: { care: 1 } },
    { id: "ca3", loadings: { care: -1 } },

    { id: "fa1", loadings: { fairness: 1 } },
    { id: "fa2", loadings: { fairness: 1 } },
    { id: "fa3", loadings: { fairness: -1 } },

    { id: "lo1", loadings: { loyalty: 1 } },
    { id: "lo2", loadings: { loyalty: 1 } },
    { id: "lo3", loadings: { loyalty: -1 } },

    { id: "au1", loadings: { authority: 1 } },
    { id: "au2", loadings: { authority: 1 } },
    { id: "au3", loadings: { authority: -1 } },

    { id: "pu1", loadings: { purity: 1 } },
    { id: "pu2", loadings: { purity: 1 } },
    { id: "pu3", loadings: { purity: -1 } },

    { id: "li1", loadings: { liberty: 1 } },
    { id: "li2", loadings: { liberty: 1 } },
    { id: "li3", loadings: { liberty: -1 } },
  ],
};
