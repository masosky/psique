import type { TestDefinition } from "./types";

// Global self-esteem: adaptation of the Rosenberg scale (1965), the most
// widely used short instrument in the history of psychology. 10 items,
// 5 direct and 5 reversed, a single trait.
// Statements in messages/{locale}.json → tests.autoestima.items
export const autoestima: TestDefinition = {
  slug: "autoestima",
  version: 1,
  emoji: "🌱",
  category: "caracter",
  traits: ["selfesteem"],
  minutes: 2,
  sources: [
    {
      citation: "Rosenberg (1965). Society and the Adolescent Self-Image. Princeton UP",
      url: "https://doi.org/10.1515/9781400876136",
      noteKey: "0",
    },
    {
      citation: "Sowislo & Orth (2013). Psychological Bulletin, 139(1), 213–240",
      url: "https://doi.org/10.1037/a0028931",
      noteKey: "1",
    },
    {
      citation: "Orth & Robins (2014). Current Directions in Psychological Science, 23(5)",
      url: "https://doi.org/10.1177/0963721414547414",
      noteKey: "2",
    },
  ],
  items: [
    { id: "ae1", loadings: { selfesteem: 1 } },
    { id: "ae2", loadings: { selfesteem: -1 } },
    { id: "ae3", loadings: { selfesteem: 1 } },
    { id: "ae4", loadings: { selfesteem: 1 } },
    { id: "ae5", loadings: { selfesteem: -1 } },
    { id: "ae6", loadings: { selfesteem: -1 } },
    { id: "ae7", loadings: { selfesteem: 1 } },
    { id: "ae8", loadings: { selfesteem: -1 } },
    { id: "ae9", loadings: { selfesteem: -1 } },
    { id: "ae10", loadings: { selfesteem: 1 } },
  ],
};
