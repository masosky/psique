// ---------------------------------------------------------------------------
// Registro central de rasgos.
//
// Todo lo que Espejo mide es un rasgo en este espacio común, puntuado 0-100.
// Cada test carga sobre un subconjunto de rasgos; el perfil del usuario es su
// vector de TraitScore.
//
// Aquí solo vive la ESTRUCTURA (id, categoría, polaridad). Los textos —nombre,
// etiquetas de polos, descripción— están en messages/{es,en}.json bajo
// `traits.<id>`, para que todo sea traducible.
// ---------------------------------------------------------------------------

export type TraitCategory =
  "politica" | "personalidad" | "oscuro" | "caracter" | "moral" | "valores" | "vinculos";

export interface TraitDef {
  id: string;
  category: TraitCategory;
  // Bipolar: el 50 es un centro con significado (política, asertividad).
  // Unipolar: la escala va de "nada" a "mucho" (narcisismo, apertura).
  bipolar: boolean;
}

const def = (id: string, category: TraitCategory, bipolar: boolean): TraitDef => ({
  id,
  category,
  bipolar,
});

export const TRAITS: Record<string, TraitDef> = {
  // política — los 6 ejes
  econ: def("econ", "politica", true),
  auth: def("auth", "politica", true),
  cult: def("cult", "politica", true),
  glob: def("glob", "politica", true),
  eco: def("eco", "politica", true),
  rel: def("rel", "politica", true),

  // personalidad — OCEAN
  openness: def("openness", "personalidad", false),
  conscientiousness: def("conscientiousness", "personalidad", false),
  extraversion: def("extraversion", "personalidad", false),
  agreeableness: def("agreeableness", "personalidad", false),
  neuroticism: def("neuroticism", "personalidad", false),

  // tríada oscura
  mach: def("mach", "oscuro", false),
  narc: def("narc", "oscuro", false),
  psyc: def("psyc", "oscuro", false),

  // carácter
  asert: def("asert", "caracter", true),
  complac: def("complac", "caracter", false),
  confl: def("confl", "caracter", false),

  // honestidad-humildad: el 6º factor de HEXACO, el que le falta al Big Five
  // y el que mejor predice comportamiento poco ético.
  honesty: def("honesty", "personalidad", false),

  // fundamentos morales (Haidt): sobre qué construyes tu moral
  care: def("care", "moral", false),
  fairness: def("fairness", "moral", false),
  loyalty: def("loyalty", "moral", false),
  authority: def("authority", "moral", false),
  purity: def("purity", "moral", false),
  liberty: def("liberty", "moral", false),

  // valores básicos (Schwartz): qué te mueve
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

  // apego adulto: cómo funcionas en las relaciones cercanas
  attachAnx: def("attachAnx", "vinculos", false),
  attachAvo: def("attachAvo", "vinculos", false),
};

export const TRAIT_IDS = Object.keys(TRAITS);

export const CATEGORIES: TraitCategory[] = [
  "politica",
  "personalidad",
  "moral",
  "valores",
  "vinculos",
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
};

export function getTrait(id: string): TraitDef {
  const t = TRAITS[id];
  if (!t) throw new Error(`Rasgo desconocido: ${id}`);
  return t;
}
