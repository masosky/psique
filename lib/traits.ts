// ---------------------------------------------------------------------------
// Central trait registry.
//
// Everything Psique measures is a trait in this shared space, scored 0-100.
// Each test loads onto a subset of traits; the user's profile is their
// TraitScore vector.
//
// Only the STRUCTURE lives here (id, category, polarity). The copy — name,
// pole labels, description — lives in messages/{es,en}.json under
// `traits.<id>`, so everything stays translatable.
// ---------------------------------------------------------------------------

export type TraitCategory =
  | "politica"
  | "personalidad"
  | "oscuro"
  | "caracter"
  | "moral"
  | "valores"
  | "vinculos"
  | "habilidades"
  | "humor";

export interface TraitDef {
  id: string;
  category: TraitCategory;
  // Bipolar: 50 is a meaningful center (politics, assertiveness).
  // Unipolar: the scale runs from "none" to "a lot" (narcissism, openness).
  bipolar: boolean;
}

const def = (id: string, category: TraitCategory, bipolar: boolean): TraitDef => ({
  id,
  category,
  bipolar,
});

export const TRAITS: Record<string, TraitDef> = {
  // politics — the 6 axes
  econ: def("econ", "politica", true),
  auth: def("auth", "politica", true),
  cult: def("cult", "politica", true),
  glob: def("glob", "politica", true),
  eco: def("eco", "politica", true),
  rel: def("rel", "politica", true),

  // personality — OCEAN
  openness: def("openness", "personalidad", false),
  conscientiousness: def("conscientiousness", "personalidad", false),
  extraversion: def("extraversion", "personalidad", false),
  agreeableness: def("agreeableness", "personalidad", false),
  neuroticism: def("neuroticism", "personalidad", false),

  // dark triad
  mach: def("mach", "oscuro", false),
  narc: def("narc", "oscuro", false),
  psyc: def("psyc", "oscuro", false),

  // character
  asert: def("asert", "caracter", true),
  complac: def("complac", "caracter", false),
  confl: def("confl", "caracter", false),

  // honesty-humility: HEXACO's 6th factor, the one the Big Five is missing
  // and the best predictor of unethical behavior.
  honesty: def("honesty", "personalidad", false),

  // moral foundations (Haidt): what you build your morality on
  care: def("care", "moral", false),
  fairness: def("fairness", "moral", false),
  loyalty: def("loyalty", "moral", false),
  authority: def("authority", "moral", false),
  purity: def("purity", "moral", false),
  liberty: def("liberty", "moral", false),

  // basic values (Schwartz): what drives you
  selfdir: def("selfdir", "valores", false),
  stimul: def("stimul", "valores", false),
  hedon: def("hedon", "valores", false),
  achieve: def("achieve", "valores", false),
  power: def("power", "valores", false),
  security: def("security", "valores", false),
  conform: def("conform", "valores", false),
  tradition: def("tradition", "valores", false),
  benev: def("benev", "valores", false),
  univers: def("univers", "valores", false),

  // adult attachment: how you operate in close relationships
  attachAnx: def("attachAnx", "vinculos", false),
  attachAvo: def("attachAvo", "vinculos", false),

  // emotional intelligence (Salovey-Mayer ability model / WLEIS):
  // perceive your own, read others', use emotion, regulate it
  selfEmo: def("selfEmo", "habilidades", false),
  otherEmo: def("otherEmo", "habilidades", false),
  useEmo: def("useEmo", "habilidades", false),
  regEmo: def("regEmo", "habilidades", false),

  // humor styles (Martin): two healthy, two that take a toll
  humorAfil: def("humorAfil", "humor", false),
  humorSelf: def("humorSelf", "humor", false),
  humorAgr: def("humorAgr", "humor", false),
  humorDest: def("humorDest", "humor", false),

  // self-concept and agency
  selfesteem: def("selfesteem", "caracter", false),
  // bipolar: external (chance decides) ↔ internal (I decide); 50 is mixed
  locus: def("locus", "caracter", true),
};

export const TRAIT_IDS = Object.keys(TRAITS);

export const CATEGORIES: TraitCategory[] = [
  "politica",
  "personalidad",
  "habilidades",
  "moral",
  "valores",
  "vinculos",
  "humor",
  "oscuro",
  "caracter",
];

export const CATEGORY_EMOJI: Record<TraitCategory, string> = {
  politica: "🧭",
  personalidad: "🧠",
  oscuro: "😈",
  caracter: "🗣️",
  moral: "⚖️",
  valores: "💎",
  vinculos: "💘",
  habilidades: "🧘",
  humor: "🤡",
};

export function getTrait(id: string): TraitDef {
  const t = TRAITS[id];
  if (!t) throw new Error(`Rasgo desconocido: ${id}`);
  return t;
}
