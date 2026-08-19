import type { TestDefinition } from "./types";

// Inteligencia emocional como conjunto de HABILIDADES (Salovey-Mayer), con la
// estructura de 4 dimensiones de la escala WLEIS: percibir lo que sientes,
// leer lo que sienten otros, usar la emoción como combustible y regularla.
// No mide "ser buena persona": mide destreza con el propio sistema emocional.
// Enunciados en messages/{locale}.json → tests.inteligencia-emocional.items
export const inteligenciaEmocional: TestDefinition = {
  slug: "inteligencia-emocional",
  version: 1,
  emoji: "🧘",
  category: "habilidades",
  traits: ["selfEmo", "otherEmo", "useEmo", "regEmo"],
  minutes: 3,
  sources: [
    {
      citation: "Salovey & Mayer (1990). Imagination, Cognition and Personality, 9(3), 185–211",
      url: "https://doi.org/10.2190/DUGG-P24E-52WK-6CDG",
      noteKey: "0",
    },
    {
      citation: "Wong & Law (2002). The Leadership Quarterly, 13(3), 243–274",
      url: "https://doi.org/10.1016/S1048-9843(02)00099-1",
      noteKey: "1",
    },
    {
      citation: "Joseph & Newman (2010). Journal of Applied Psychology, 95(1), 54–78",
      url: "https://doi.org/10.1037/a0017286",
      noteKey: "2",
    },
  ],
  items: [
    // percepción propia
    { id: "ie1", loadings: { selfEmo: 1 } },
    { id: "ie2", loadings: { selfEmo: 1 } },
    { id: "ie3", loadings: { selfEmo: -1 } },
    { id: "ie4", loadings: { selfEmo: 1 } },
    // percepción ajena
    { id: "ie5", loadings: { otherEmo: 1 } },
    { id: "ie6", loadings: { otherEmo: 1 } },
    { id: "ie7", loadings: { otherEmo: -1 } },
    { id: "ie8", loadings: { otherEmo: 1 } },
    // uso de la emoción
    { id: "ie9", loadings: { useEmo: 1 } },
    { id: "ie10", loadings: { useEmo: 1 } },
    { id: "ie11", loadings: { useEmo: -1 } },
    { id: "ie12", loadings: { useEmo: 1 } },
    // regulación
    { id: "ie13", loadings: { regEmo: 1 } },
    { id: "ie14", loadings: { regEmo: 1 } },
    { id: "ie15", loadings: { regEmo: -1 } },
    { id: "ie16", loadings: { regEmo: -1 } },
  ],
};
