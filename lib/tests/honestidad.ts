import type { TestDefinition } from "./types";

// Honestidad-Humildad: el sexto factor de HEXACO, el que el Big Five no
// captura. Es el mejor predictor de conducta poco ética (más que amabilidad)
// y correlaciona negativo con toda la tríada oscura. 10 ítems.
// Enunciados en messages/{locale}.json → tests.honestidad.items
export const honestidad: TestDefinition = {
  slug: "honestidad",
  version: 1,
  emoji: "🎭",
  category: "personalidad",
  traits: ["honesty"],
  minutes: 2,
  sources: [
    {
      citation: "Lee & Ashton (2004). Multivariate Behavioral Research, 39(2), 329–358",
      url: "https://doi.org/10.1207/s15327906mbr3902_8",
      noteKey: "0",
    },
    {
      citation: "Ashton & Lee (2009). HEXACO-60. J. Personality Assessment, 91(4), 340–345",
      url: "https://doi.org/10.1080/00223890902935878",
      noteKey: "1",
    },
    {
      citation: "hexaco.org — inventario y baremos",
      url: "https://hexaco.org",
      noteKey: "2",
    },
  ],
  items: [
    { id: "h1", loadings: { honesty: -1 } },
    { id: "h2", loadings: { honesty: -1 } },
    { id: "h3", loadings: { honesty: 1 } },
    { id: "h4", loadings: { honesty: -1 } },
    { id: "h5", loadings: { honesty: 1 } },
    { id: "h6", loadings: { honesty: -1 } },
    { id: "h7", loadings: { honesty: 1 } },
    { id: "h8", loadings: { honesty: -1 } },
    { id: "h9", loadings: { honesty: 1 } },
    { id: "h10", loadings: { honesty: -1 } },
  ],
};
