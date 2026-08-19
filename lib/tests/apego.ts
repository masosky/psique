import type { TestDefinition } from "./types";

// Apego adulto (ECR-S): dos dimensiones continuas, ansiedad y evitación. Los
// cuatro "estilos" populares (seguro, ansioso, evitativo, desorganizado) son
// los cuadrantes de este plano — así que aquí se miden bien, no por etiqueta.
// 12 ítems, 6 por dimensión.
// Enunciados en messages/{locale}.json → tests.apego.items
export const apego: TestDefinition = {
  slug: "apego",
  version: 1,
  emoji: "💘",
  category: "vinculos",
  traits: ["attachAnx", "attachAvo"],
  minutes: 3,
  sources: [
    {
      citation: "Brennan, Clark & Shaver (1998). ECR — Attachment Theory and Close Relationships",
      url: "https://psycnet.apa.org/record/1997-36873-002",
      noteKey: "0",
    },
    {
      citation: "Wei et al. (2007). ECR Short Form. J. Personality Assessment, 88(2), 187–204",
      url: "https://doi.org/10.1080/00223890701268041",
      noteKey: "1",
    },
    {
      citation: "Fraley, Waller & Brennan (2000). ECR-R. JPSP, 78(2), 350–365",
      url: "https://doi.org/10.1037/0022-3514.78.2.350",
      noteKey: "2",
    },
  ],
  items: [
    // ansiedad de apego
    { id: "an1", loadings: { attachAnx: 1 } },
    { id: "an2", loadings: { attachAnx: 1 } },
    { id: "an3", loadings: { attachAnx: 1 } },
    { id: "an4", loadings: { attachAnx: 1 } },
    { id: "an5", loadings: { attachAnx: -1 } },
    { id: "an6", loadings: { attachAnx: -1 } },

    // evitación de la intimidad
    { id: "av1", loadings: { attachAvo: 1 } },
    { id: "av2", loadings: { attachAvo: 1 } },
    { id: "av3", loadings: { attachAvo: 1 } },
    { id: "av4", loadings: { attachAvo: -1 } },
    { id: "av5", loadings: { attachAvo: -1 } },
    { id: "av6", loadings: { attachAvo: -1 } },
  ],
};
