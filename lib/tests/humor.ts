import type { TestDefinition } from "./types";

// Martin's humor styles (HSQ): two adaptive (affiliative, self-enhancing)
// and two that take a toll (aggressive, self-defeating). What you laugh at,
// and at whose expense, says far more about you than how much you laugh.
// Statements in messages/{locale}.json → tests.humor.items
export const humor: TestDefinition = {
  slug: "humor",
  version: 1,
  emoji: "🤡",
  category: "humor",
  traits: ["humorAfil", "humorSelf", "humorAgr", "humorDest"],
  minutes: 3,
  sources: [
    {
      citation: "Martin et al. (2003). Journal of Research in Personality, 37(1), 48–75",
      url: "https://doi.org/10.1016/S0092-6566(02)00534-2",
      noteKey: "0",
    },
    {
      citation: "Schneider, Voracek & Tran (2018). Scandinavian Journal of Psychology, 59(3)",
      url: "https://doi.org/10.1111/sjop.12432",
      noteKey: "1",
    },
    {
      citation: "Plessen et al. (2020). Personality and Individual Differences, 154, 110218",
      url: "https://doi.org/10.1016/j.paid.2020.110218",
      noteKey: "2",
    },
  ],
  items: [
    // affiliative: humor that bonds
    { id: "hu1", loadings: { humorAfil: 1 } },
    { id: "hu2", loadings: { humorAfil: 1 } },
    { id: "hu3", loadings: { humorAfil: -1 } },
    { id: "hu4", loadings: { humorAfil: 1 } },
    // self-enhancing: humor that holds you up
    { id: "hu5", loadings: { humorSelf: 1 } },
    { id: "hu6", loadings: { humorSelf: 1 } },
    { id: "hu7", loadings: { humorSelf: -1 } },
    { id: "hu8", loadings: { humorSelf: 1 } },
    // aggressive: humor that cuts
    { id: "hu9", loadings: { humorAgr: 1 } },
    { id: "hu10", loadings: { humorAgr: 1 } },
    { id: "hu11", loadings: { humorAgr: -1 } },
    { id: "hu12", loadings: { humorAgr: 1 } },
    // self-defeating: making yourself the target to be liked
    { id: "hu13", loadings: { humorDest: 1 } },
    { id: "hu14", loadings: { humorDest: 1 } },
    { id: "hu15", loadings: { humorDest: 1 } },
    { id: "hu16", loadings: { humorDest: -1 } },
  ],
};
