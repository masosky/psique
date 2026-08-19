import type { TestDefinition } from "./types";

// «Test de pusilánime»: asertividad, complacencia (people pleasing) y
// evitación del conflicto. 12 ítems.
// Enunciados en messages/{locale}.json → tests.asertividad.items
export const asertividad: TestDefinition = {
  slug: "asertividad",
  version: 1,
  emoji: "🗣️",
  category: "caracter",
  traits: ["asert", "complac", "confl"],
  minutes: 3,
  sources: [
    {
      citation: "Rathus (1973). Behavior Therapy, 4(3), 398–406",
      url: "https://doi.org/10.1016/S0005-7894(73)80120-0",
      noteKey: "0",
    },
    {
      citation: "Rahim (1983). Academy of Management Journal, 26(2), 368–376",
      url: "https://doi.org/10.5465/255985",
      noteKey: "1",
    },
    {
      citation: "Hill & Hill (1993). Sociotropy & the need for approval",
      url: "https://doi.org/10.1016/0191-8869(93)90189-A",
      noteKey: "2",
    },
  ],
  items: [
    { id: "as1", loadings: { asert: 1 } },
    { id: "as2", loadings: { asert: 1 } },
    { id: "as3", loadings: { asert: -1 } },
    { id: "as4", loadings: { asert: 1 } },

    { id: "co1", loadings: { complac: 1 } },
    { id: "co2", loadings: { complac: 1 } },
    { id: "co3", loadings: { complac: 1 } },
    { id: "co4", loadings: { complac: -1 } },

    { id: "cf1", loadings: { confl: 1 } },
    { id: "cf2", loadings: { confl: 1 } },
    { id: "cf3", loadings: { confl: -1 } },
    { id: "cf4", loadings: { confl: 1 } },
  ],
};
