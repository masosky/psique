import type { TestDefinition } from "./types";

// Emotional intelligence as a set of ABILITIES (Salovey-Mayer), with the
// 4-dimension structure of the WLEIS scale: perceiving what you feel,
// reading what others feel, using emotion as fuel, and regulating it.
// It doesn't measure "being a good person": it measures skill with your own
// emotional system.
// Statements in messages/{locale}.json → tests.inteligencia-emocional.items
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
    // perceiving one's own emotions
    { id: "ie1", loadings: { selfEmo: 1 } },
    { id: "ie2", loadings: { selfEmo: 1 } },
    { id: "ie3", loadings: { selfEmo: -1 } },
    { id: "ie4", loadings: { selfEmo: 1 } },
    // perceiving others' emotions
    { id: "ie5", loadings: { otherEmo: 1 } },
    { id: "ie6", loadings: { otherEmo: 1 } },
    { id: "ie7", loadings: { otherEmo: -1 } },
    { id: "ie8", loadings: { otherEmo: 1 } },
    // use of emotion
    { id: "ie9", loadings: { useEmo: 1 } },
    { id: "ie10", loadings: { useEmo: 1 } },
    { id: "ie11", loadings: { useEmo: -1 } },
    { id: "ie12", loadings: { useEmo: 1 } },
    // regulation
    { id: "ie13", loadings: { regEmo: 1 } },
    { id: "ie14", loadings: { regEmo: 1 } },
    { id: "ie15", loadings: { regEmo: -1 } },
    { id: "ie16", loadings: { regEmo: -1 } },
  ],
};
