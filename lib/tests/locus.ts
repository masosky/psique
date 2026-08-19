import type { TestDefinition } from "./types";

// Locus de control (Rotter): ¿atribuyes lo que te pasa a tu esfuerzo (interno)
// o a la suerte, los contactos y el sistema (externo)? Bipolar: 0 = externo,
// 100 = interno. Formato Likert en lugar de la elección forzada original.
// Enunciados en messages/{locale}.json → tests.locus.items
export const locus: TestDefinition = {
  slug: "locus",
  version: 1,
  emoji: "🕹️",
  category: "caracter",
  traits: ["locus"],
  minutes: 2,
  sources: [
    {
      citation: "Rotter (1966). Psychological Monographs, 80(1), 1–28",
      url: "https://doi.org/10.1037/h0092976",
      noteKey: "0",
    },
    {
      citation: "Ng, Sorensen & Eby (2006). Journal of Organizational Behavior, 27(8)",
      url: "https://doi.org/10.1002/job.416",
      noteKey: "1",
    },
    {
      citation: "Cheng, Cheung, Chio & Chan (2013). Psychological Bulletin, 139(1)",
      url: "https://doi.org/10.1037/a0028596",
      noteKey: "2",
    },
  ],
  items: [
    { id: "lc1", loadings: { locus: 1 } },
    { id: "lc2", loadings: { locus: -1 } },
    { id: "lc3", loadings: { locus: 1 } },
    { id: "lc4", loadings: { locus: -1 } },
    { id: "lc5", loadings: { locus: 1 } },
    { id: "lc6", loadings: { locus: -1 } },
    { id: "lc7", loadings: { locus: 1 } },
    { id: "lc8", loadings: { locus: -1 } },
  ],
};
