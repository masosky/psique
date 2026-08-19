import type { TestDefinition } from "./types";

// Tríada oscura (maquiavelismo, narcisismo, psicopatía), 15 ítems, inspirado
// en el formato del Short Dark Triad con redacción propia. Tono con humor,
// pero la estructura de medida es seria. No es un diagnóstico.
// Enunciados en messages/{locale}.json → tests.lado-oscuro.items
export const ladoOscuro: TestDefinition = {
  slug: "lado-oscuro",
  version: 1,
  emoji: "😈",
  category: "oscuro",
  traits: ["mach", "narc", "psyc"],
  minutes: 3,
  sources: [
    {
      citation: "Paulhus & Williams (2002). Journal of Research in Personality, 36(6), 556–563",
      url: "https://doi.org/10.1016/S0092-6566(02)00505-6",
      noteKey: "0",
    },
    {
      citation: "Jones & Paulhus (2014). Short Dark Triad (SD3). Assessment, 21(1), 28–41",
      url: "https://doi.org/10.1177/1073191113514105",
      noteKey: "1",
    },
  ],
  items: [
    { id: "m1", loadings: { mach: 1 } },
    { id: "m2", loadings: { mach: 1 } },
    { id: "m3", loadings: { mach: 1 } },
    { id: "m4", loadings: { mach: 1 } },
    { id: "m5", loadings: { mach: -1 } },

    { id: "na1", loadings: { narc: 1 } },
    { id: "na2", loadings: { narc: 1 } },
    { id: "na3", loadings: { narc: 1 } },
    { id: "na4", loadings: { narc: 1 } },
    { id: "na5", loadings: { narc: -1 } },

    { id: "p1", loadings: { psyc: 1 } },
    { id: "p2", loadings: { psyc: 1 } },
    { id: "p3", loadings: { psyc: 1 } },
    { id: "p4", loadings: { psyc: 1 } },
    { id: "p5", loadings: { psyc: -1 } },
  ],
};
