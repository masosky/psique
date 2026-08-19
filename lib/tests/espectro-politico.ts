import type { TestDefinition } from "./types";

// 24 ítems, 4 por eje. Cada eje tiene ítems en ambas direcciones para
// compensar el sesgo de aquiescencia (tender a decir "de acuerdo" a todo).
// Enunciados en messages/{locale}.json → tests.espectro-politico.items
export const espectroPolitico: TestDefinition = {
  slug: "espectro-politico",
  version: 1,
  emoji: "🧭",
  category: "politica",
  traits: ["econ", "auth", "cult", "glob", "eco", "rel"],
  minutes: 5,
  sources: [
    {
      citation: "Feldman & Johnston (2014). Political Psychology, 35(3), 337–358",
      url: "https://doi.org/10.1111/pops.12055",
      noteKey: "0",
    },
    {
      citation: "Duckitt & Sibley (2009). Psychological Inquiry, 20(2–3), 98–109",
      url: "https://doi.org/10.1080/10478400903028540",
      noteKey: "1",
    },
    {
      citation: "Eysenck (1954). The Psychology of Politics",
      url: "https://doi.org/10.4324/9780203000342",
      noteKey: "2",
    },
  ],
  items: [
    // económico (0 = igualdad, 100 = mercado)
    { id: "econ1", loadings: { econ: 1 } },
    { id: "econ2", loadings: { econ: -1 } },
    { id: "econ3", loadings: { econ: -1 } },
    { id: "econ4", loadings: { econ: 1 } },

    // autoridad (0 = libertario, 100 = autoritario)
    { id: "auth1", loadings: { auth: 1 } },
    { id: "auth2", loadings: { auth: -1 } },
    { id: "auth3", loadings: { auth: 1 } },
    { id: "auth4", loadings: { auth: -1 } },

    // cultural (0 = progresista, 100 = tradicional)
    { id: "cult1", loadings: { cult: 1 } },
    { id: "cult2", loadings: { cult: 1 } },
    { id: "cult3", loadings: { cult: -1 } },
    { id: "cult4", loadings: { cult: -1 } },

    // territorial (0 = globalista, 100 = nacionalista)
    { id: "glob1", loadings: { glob: 1 } },
    { id: "glob2", loadings: { glob: -1 } },
    { id: "glob3", loadings: { glob: -1 } },
    { id: "glob4", loadings: { glob: 1 } },

    // ecológico (0 = ecologista, 100 = productivista)
    { id: "eco1", loadings: { eco: -1 } },
    { id: "eco2", loadings: { eco: 1 } },
    { id: "eco3", loadings: { eco: -1 } },
    { id: "eco4", loadings: { eco: 1 } },

    // religioso (0 = laico, 100 = religioso)
    { id: "rel1", loadings: { rel: 1 } },
    { id: "rel2", loadings: { rel: -1 } },
    { id: "rel3", loadings: { rel: 1 } },
    { id: "rel4", loadings: { rel: -1 } },
  ],
};
