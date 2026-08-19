// ---------------------------------------------------------------------------
// Motor de insights: reglas declarativas sobre el vector de rasgos.
//
// Cada regla exige que ciertos rasgos estén medidos (`needs`) y se dispara con
// una condición sobre el perfil. Así los insights se van desbloqueando a
// medida que el usuario completa tests — el gancho central del producto.
//
// Las reglas son puras: devuelven ids. Los textos viven en
// messages/{locale}.json bajo `insights.<id>.{title,body}`.
// ---------------------------------------------------------------------------

export type Profile = Record<string, number>; // traitId -> 0..100 (solo los medidos)

export type InsightKind = "fortaleza" | "riesgo" | "curiosidad";

export interface Insight {
  id: string;
  kind: InsightKind;
  traits: string[]; // rasgos implicados (para pintar chips en la UI)
}

interface Rule extends Insight {
  needs: string[];
  when: (p: Profile) => boolean;
}

const R = (
  id: string,
  kind: InsightKind,
  needs: string[],
  when: (p: Profile) => boolean,
): Rule => ({ id, kind, needs, when, traits: needs });

const RULES: Rule[] = [
  // ------------------------------------------------------------- fortalezas
  R("ejecutor", "fortaleza", ["conscientiousness"], (p) => p.conscientiousness >= 70),
  R("roca", "fortaleza", ["neuroticism"], (p) => p.neuroticism <= 30),
  R("explorador", "fortaleza", ["openness"], (p) => p.openness >= 70),
  R(
    "amable-con-limites",
    "fortaleza",
    ["agreeableness", "complac"],
    (p) => p.agreeableness >= 65 && p.complac <= 45,
  ),
  R("voz-propia", "fortaleza", ["asert"], (p) => p.asert >= 70),
  R(
    "pegamento",
    "fortaleza",
    ["extraversion", "agreeableness"],
    (p) => p.extraversion >= 65 && p.agreeableness >= 60,
  ),
  R("manos-limpias", "fortaleza", ["mach", "psyc"], (p) => p.mach <= 30 && p.psyc <= 30),
  R(
    "creativo-que-entrega",
    "fortaleza",
    ["openness", "conscientiousness"],
    (p) => p.openness >= 60 && p.conscientiousness >= 60,
  ),

  // ---------------------------------------------------------------- riesgos
  R("procrastinador", "riesgo", ["conscientiousness"], (p) => p.conscientiousness <= 35),
  R("rumiante", "riesgo", ["neuroticism"], (p) => p.neuroticism >= 70),
  R(
    "mal-negociador",
    "riesgo",
    ["agreeableness", "asert"],
    (p) => p.agreeableness >= 70 && p.asert <= 40,
  ),
  R("galeria", "riesgo", ["complac"], (p) => p.complac >= 65),
  R(
    "conflicto-podrido",
    "riesgo",
    ["confl", "neuroticism"],
    (p) => p.confl >= 65 && p.neuroticism >= 55,
  ),
  R(
    "reputacion",
    "riesgo",
    ["mach", "agreeableness"],
    (p) => p.mach >= 65 && p.agreeableness <= 40,
  ),
  R("aplauso", "riesgo", ["narc"], (p) => p.narc >= 70),
  R("frio", "riesgo", ["psyc"], (p) => p.psyc >= 65),
  R("confort-blindado", "riesgo", ["openness"], (p) => p.openness <= 30),

  // ------------------------------------------------------------ curiosidades
  R("libro-abierto", "curiosidad", ["openness", "cult"], (p) => p.openness >= 60 && p.cult <= 40),
  R("contracorriente", "curiosidad", ["openness", "cult"], (p) => p.openness >= 60 && p.cult >= 60),
  R(
    "orden-total",
    "curiosidad",
    ["conscientiousness", "auth"],
    (p) => p.conscientiousness >= 60 && p.auth >= 55,
  ),
  R(
    "artista-ansioso",
    "curiosidad",
    ["neuroticism", "openness"],
    (p) => p.neuroticism >= 60 && p.openness >= 60,
  ),
  R("izquierda-tradicional", "curiosidad", ["econ", "cult"], (p) => p.econ <= 35 && p.cult >= 60),
  R("liberal-clasico", "curiosidad", ["econ", "auth"], (p) => p.econ >= 65 && p.auth <= 35),
  R("libertario-izq", "curiosidad", ["econ", "auth"], (p) => p.econ <= 35 && p.auth <= 35),
  R("eco-mercado", "curiosidad", ["econ", "eco"], (p) => p.econ >= 60 && p.eco <= 35),
  R("batallas-elegidas", "curiosidad", ["asert", "confl"], (p) => p.asert >= 60 && p.confl >= 60),
  R(
    "estratega-que-gusta",
    "curiosidad",
    ["mach", "complac"],
    (p) => p.mach >= 60 && p.complac >= 60,
  ),
  R("fe-progresista", "curiosidad", ["rel", "cult"], (p) => p.rel >= 60 && p.cult <= 40),
  R(
    "montana-rusa",
    "curiosidad",
    ["extraversion", "neuroticism"],
    (p) => p.extraversion >= 65 && p.neuroticism >= 60,
  ),
  R(
    "ermitano-curioso",
    "curiosidad",
    ["extraversion", "openness"],
    (p) => p.extraversion <= 35 && p.openness >= 60,
  ),

  // ------------------------------------------- moral, valores y vínculos
  R("moral-binding", "curiosidad", ["loyalty", "authority", "purity", "care"], (p) => {
    const binding = (p.loyalty + p.authority + p.purity) / 3;
    return binding >= 60 && binding > p.care;
  }),
  R(
    "moral-individual",
    "curiosidad",
    ["care", "fairness", "loyalty", "authority", "purity"],
    (p) => {
      const individual = (p.care + p.fairness) / 2;
      const binding = (p.loyalty + p.authority + p.purity) / 3;
      return individual - binding >= 20;
    },
  ),
  R(
    "libertad-primero",
    "curiosidad",
    ["liberty", "authority"],
    (p) => p.liberty >= 70 && p.authority <= 40,
  ),
  R("brujula-firme", "fortaleza", ["honesty", "mach"], (p) => p.honesty >= 70 && p.mach <= 40),
  R("tentacion", "riesgo", ["honesty", "power"], (p) => p.honesty <= 35 && p.power >= 60),
  R(
    "apego-seguro",
    "fortaleza",
    ["attachAnx", "attachAvo"],
    (p) => p.attachAnx <= 40 && p.attachAvo <= 40,
  ),
  R(
    "apego-ansioso",
    "riesgo",
    ["attachAnx", "attachAvo"],
    (p) => p.attachAnx >= 60 && p.attachAvo <= 45,
  ),
  R(
    "apego-evitativo",
    "riesgo",
    ["attachAvo", "attachAnx"],
    (p) => p.attachAvo >= 60 && p.attachAnx <= 45,
  ),
  R(
    "apego-temeroso",
    "riesgo",
    ["attachAnx", "attachAvo"],
    (p) => p.attachAnx >= 60 && p.attachAvo >= 60,
  ),
  R(
    "ansiedad-y-complacencia",
    "riesgo",
    ["attachAnx", "complac"],
    (p) => p.attachAnx >= 60 && p.complac >= 60,
  ),
  R(
    "motor-logro",
    "fortaleza",
    ["achieve", "conscientiousness"],
    (p) => p.achieve >= 65 && p.conscientiousness >= 65,
  ),
  R(
    "hedonista-explorador",
    "curiosidad",
    ["hedon", "stimul", "security"],
    (p) => p.hedon >= 65 && p.stimul >= 65 && p.security <= 45,
  ),
  R(
    "ancla-seguridad",
    "curiosidad",
    ["security", "conform", "stimul"],
    (p) => p.security >= 65 && p.conform >= 60 && p.stimul <= 40,
  ),
  R("universalista", "fortaleza", ["univers", "benev"], (p) => p.univers >= 70 && p.benev >= 65),
  R(
    "poder-sin-frenos",
    "riesgo",
    ["power", "benev", "honesty"],
    (p) => p.power >= 65 && p.benev <= 40 && p.honesty <= 45,
  ),
  R(
    "valores-vs-politica",
    "curiosidad",
    ["univers", "econ"],
    (p) => p.univers >= 70 && p.econ >= 65,
  ),
  R("cuidado-sin-limites", "riesgo", ["care", "asert"], (p) => p.care >= 70 && p.asert <= 40),

  // ——— inteligencia emocional ———
  R(
    "termostato",
    "fortaleza",
    ["regEmo", "neuroticism"],
    (p) => p.regEmo >= 70 && p.neuroticism <= 40,
  ),
  R(
    "piloto-a-ciegas",
    "riesgo",
    ["selfEmo", "neuroticism"],
    (p) => p.selfEmo <= 35 && p.neuroticism >= 55,
  ),
  R("lector-estratega", "curiosidad", ["otherEmo", "mach"], (p) => p.otherEmo >= 65 && p.mach >= 60),
  R(
    "corazon-sin-radar",
    "curiosidad",
    ["care", "otherEmo"],
    (p) => p.care >= 65 && p.otherEmo <= 40,
  ),

  // ——— estilos de humor ———
  R(
    "pegamento-social",
    "fortaleza",
    ["humorAfil", "extraversion"],
    (p) => p.humorAfil >= 70 && p.extraversion >= 60,
  ),
  R(
    "escudo-de-risa",
    "fortaleza",
    ["humorSelf", "neuroticism"],
    (p) => p.humorSelf >= 65 && p.neuroticism >= 60,
  ),
  R("filo-que-corta", "riesgo", ["humorAgr", "psyc"], (p) => p.humorAgr >= 65 && p.psyc >= 60),
  R(
    "payaso-triste",
    "riesgo",
    ["humorDest", "selfesteem"],
    (p) => p.humorDest >= 65 && p.selfesteem <= 40,
  ),

  // ——— autoestima y locus ———
  R("critico-interno", "riesgo", ["selfesteem"], (p) => p.selfesteem <= 30),
  R("ego-blindado", "curiosidad", ["selfesteem", "narc"], (p) => p.selfesteem >= 70 && p.narc >= 65),
  R(
    "timon-propio",
    "fortaleza",
    ["locus", "conscientiousness"],
    (p) => p.locus >= 70 && p.conscientiousness >= 65,
  ),
  R("espectador", "riesgo", ["locus", "asert"], (p) => p.locus <= 30 && p.asert <= 40),
  R(
    "motor-exigente",
    "curiosidad",
    ["locus", "selfesteem"],
    (p) => p.locus >= 65 && p.selfesteem <= 40,
  ),
];

export const INSIGHT_COUNT = RULES.length;

export const INSIGHT_IDS = RULES.map((r) => r.id);

// Reglas aún no evaluables porque falta medir algún rasgo. Sirve para el
// gancho de "haz X test para desbloquear N insights".
export function lockedInsightCount(profile: Profile): number {
  return RULES.filter((r) => r.needs.some((t) => profile[t] === undefined)).length;
}

export function getInsights(profile: Profile): Insight[] {
  return RULES.filter((r) => r.needs.every((t) => profile[t] !== undefined) && r.when(profile)).map(
    ({ id, kind, traits }) => ({ id, kind, traits }),
  );
}

// ---------------------------------------------------------------------------
// Etiquetas agregadas por categoría. Devuelven la CLAVE del arquetipo; el
// nombre y la descripción se traducen en la página.
// ---------------------------------------------------------------------------

// Arquetipo político sobre la matriz econ × auth, matizado por cult.
// Claves: `archetypes.political.<key>` (+ sufijo `-trad` cuando aplica).
export function politicalArchetype(p: Profile): { key: string; traditional: boolean } | null {
  const { econ, auth, cult } = p;
  if (econ === undefined || auth === undefined) return null;

  const e = econ < 40 ? 0 : econ >= 60 ? 2 : 1; // 0 izq, 1 centro, 2 der
  const a = auth < 40 ? 0 : auth >= 60 ? 2 : 1; // 0 lib, 1 centro, 2 aut

  const keys = [
    ["libertario-izq", "socialdemocrata", "socialismo-orden"],
    ["centrista-libertario", "centrista", "centrista-orden"],
    ["liberal-clasico", "liberal", "conservador-orden"],
  ];

  // El matiz tradicional solo aporta cuando no está ya implícito en el
  // cuadrante (derecha económica o autoritarismo).
  const traditional = (cult ?? 50) >= 60 && e !== 2 && a !== 2;
  return { key: keys[e][a], traditional };
}

const tierOf = (score: number): string =>
  score < 25 ? "t1" : score < 45 ? "t2" : score < 60 ? "t3" : score < 75 ? "t4" : "t5";

// «Nivel de villano»: media de la tríada oscura.
// Claves: `archetypes.dark.<tier>.{name,description}`.
export function darkLevel(p: Profile): { score: number; tier: string } | null {
  const { mach, narc, psyc } = p;
  if (mach === undefined || narc === undefined || psyc === undefined) return null;
  const score = Math.round((mach + narc + psyc) / 3);
  return { score, tier: tierOf(score) };
}

// Estilo de apego: los 4 cuadrantes del plano ansiedad × evitación.
// Claves: `archetypes.attachment.<key>.{name,description}`.
export function attachmentStyle(p: Profile): { key: string; anx: number; avo: number } | null {
  const { attachAnx: anx, attachAvo: avo } = p;
  if (anx === undefined || avo === undefined) return null;
  const highAnx = anx >= 50;
  const highAvo = avo >= 50;
  const key = highAnx ? (highAvo ? "temeroso" : "ansioso") : highAvo ? "evitativo" : "seguro";
  return { key, anx: Math.round(anx), avo: Math.round(avo) };
}

// Perfil moral: qué fundamento pesa más y el balance individualizante
// (cuidado + justicia) frente al vinculante (lealtad + autoridad + pureza).
// Claves: `archetypes.moral.<key>.{name,description}`.
export function moralProfile(
  p: Profile,
): { key: string; top: string; individual: number; binding: number } | null {
  const ids = ["care", "fairness", "loyalty", "authority", "purity", "liberty"];
  if (ids.some((t) => p[t] === undefined)) return null;

  const individual = Math.round((p.care + p.fairness) / 2);
  const binding = Math.round((p.loyalty + p.authority + p.purity) / 3);
  const top = ids.reduce((best, t) => (p[t] > p[best] ? t : best), ids[0]);

  const diff = individual - binding;
  const key =
    p.liberty >= Math.max(individual, binding) + 10
      ? "libertaria"
      : diff >= 15
        ? "individualizante"
        : diff <= -15
          ? "vinculante"
          : "equilibrada";
  return { key, top, individual, binding };
}

// Índice de pusilanimidad: baja asertividad + complacencia + evitación.
// Claves: `archetypes.pusilanime.<tier>.{name,description}`.
export function pusilanimeIndex(p: Profile): { score: number; tier: string } | null {
  const { asert, complac, confl } = p;
  if (asert === undefined || complac === undefined || confl === undefined) return null;
  const score = Math.round((100 - asert + complac + confl) / 3);
  return { score, tier: tierOf(score) };
}

// Nivel de autoestima (Rosenberg). Claves: `archetypes.autoestima.<tier>`.
export function selfEsteemLevel(p: Profile): { score: number; tier: string } | null {
  if (p.selfesteem === undefined) return null;
  const score = Math.round(p.selfesteem);
  return { score, tier: tierOf(score) };
}

// Locus de control: 0 externo (el azar decide) → 100 interno (yo decido).
// Claves: `archetypes.locus.<tier>`.
export function locusLevel(p: Profile): { score: number; tier: string } | null {
  if (p.locus === undefined) return null;
  const score = Math.round(p.locus);
  return { score, tier: tierOf(score) };
}
