import type { TestDefinition } from "./types";

// Big Five (OCEAN), 20 ítems (4 por rasgo), inspirado en el formato IPIP de
// dominio público. Mitad de ítems invertidos.
// Enunciados en messages/{locale}.json → tests.big-five.items
export const bigFive: TestDefinition = {
  slug: "big-five",
  version: 1,
  emoji: "🧠",
  category: "personalidad",
  traits: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
  minutes: 4,
  sources: [
    {
      citation: "Goldberg (1992). Psychological Assessment, 4(1), 26–42",
      url: "https://doi.org/10.1037/1040-3590.4.1.26",
      noteKey: "0",
    },
    {
      citation: "International Personality Item Pool (IPIP)",
      url: "https://ipip.ori.org",
      noteKey: "1",
    },
    {
      citation: "Soto & John (2017). BFI-2. JPSP, 113(1), 117–143",
      url: "https://doi.org/10.1037/pspp0000096",
      noteKey: "2",
    },
  ],
  items: [
    { id: "o1", loadings: { openness: 1 } },
    { id: "o2", loadings: { openness: -1 } },
    { id: "o3", loadings: { openness: 1 } },
    { id: "o4", loadings: { openness: -1 } },

    { id: "c1", loadings: { conscientiousness: 1 } },
    { id: "c2", loadings: { conscientiousness: -1 } },
    { id: "c3", loadings: { conscientiousness: 1 } },
    { id: "c4", loadings: { conscientiousness: -1 } },

    { id: "e1", loadings: { extraversion: 1 } },
    { id: "e2", loadings: { extraversion: -1 } },
    { id: "e3", loadings: { extraversion: 1 } },
    { id: "e4", loadings: { extraversion: -1 } },

    { id: "a1", loadings: { agreeableness: 1 } },
    { id: "a2", loadings: { agreeableness: -1 } },
    { id: "a3", loadings: { agreeableness: 1 } },
    { id: "a4", loadings: { agreeableness: -1 } },

    { id: "n1", loadings: { neuroticism: 1 } },
    { id: "n2", loadings: { neuroticism: -1 } },
    { id: "n3", loadings: { neuroticism: 1 } },
    { id: "n4", loadings: { neuroticism: -1 } },
  ],
};
