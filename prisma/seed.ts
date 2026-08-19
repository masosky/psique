// Población sintética de calibración (~420 perfiles).
//
// Sin población, percentiles y correlaciones no cuentan nada el día 1. Estos
// perfiles se generan con un modelo de factores latentes para que las
// correlaciones entre rasgos sean plausibles (ej.: apertura ↔ progresismo,
// tríada oscura ↔ baja amabilidad), no ruido blanco. Van marcados con
// isSeed=true para poder excluirlos o purgarlos cuando haya usuarios reales.
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TRAIT_IDS } from "../lib/traits";
import { TESTS } from "../lib/tests";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const N_USERS = 420;

// PRNG determinista (mulberry32) para que el seed sea reproducible.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260815);

// Normal estándar vía Box-Muller.
function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

// Cargas de cada rasgo sobre los factores latentes:
// cons (conservadurismo), dark (tríada), anx (ansiedad social),
// extra (energía social), disc (disciplina).
type Factor = "cons" | "dark" | "anx" | "extra" | "disc";

const LOADINGS: Record<string, Partial<Record<Factor, number>>> = {
  econ: { cons: 0.5 },
  auth: { cons: 0.7, disc: 0.2 },
  cult: { cons: 0.9 },
  glob: { cons: 0.7 },
  eco: { cons: 0.6 },
  rel: { cons: 0.75 },
  openness: { cons: -0.55, extra: 0.15 },
  conscientiousness: { disc: 0.85 },
  extraversion: { extra: 0.85 },
  agreeableness: { dark: -0.6, anx: 0.15 },
  neuroticism: { anx: 0.8 },
  mach: { dark: 0.75 },
  narc: { dark: 0.6, extra: 0.35 },
  psyc: { dark: 0.7, anx: -0.15 },
  asert: { anx: -0.55, extra: 0.35, dark: 0.15 },
  complac: { anx: 0.65, dark: -0.2 },
  confl: { anx: 0.6, extra: -0.2 },

  // honestidad-humildad: casi el reverso exacto de la tríada oscura
  honesty: { dark: -0.75 },

  // fundamentos morales: los "vinculantes" cargan en conservadurismo, los
  // "individualizantes" apenas — que es justo el hallazgo de Graham et al.
  care: { dark: -0.45, cons: -0.15 },
  fairness: { dark: -0.4, cons: -0.2 },
  loyalty: { cons: 0.7 },
  authority: { cons: 0.8, disc: 0.15 },
  purity: { cons: 0.8 },
  liberty: { cons: -0.15, dark: 0.2 },

  // valores de Schwartz: siguen la estructura circular (apertura al cambio vs
  // conservación; autotrascendencia vs autopromoción)
  selfdir: { cons: -0.5 },
  stimul: { cons: -0.45, extra: 0.35 },
  hedon: { cons: -0.3, extra: 0.4, disc: -0.2 },
  achieve: { disc: 0.4, dark: 0.35, extra: 0.2 },
  power: { dark: 0.6, cons: 0.2 },
  security: { cons: 0.6, anx: 0.3 },
  conform: { cons: 0.65, anx: 0.25, disc: 0.2 },
  tradition: { cons: 0.85 },
  benev: { dark: -0.55 },
  univers: { cons: -0.6, dark: -0.35 },

  // apego: ansiedad va con neuroticismo; evitación con baja extraversión y
  // algo de dureza emocional
  attachAnx: { anx: 0.8 },
  attachAvo: { extra: -0.4, dark: 0.35, anx: 0.2 },
};

function generateProfile(): Record<string, number> {
  const z = { cons: randn(), dark: randn(), anx: randn(), extra: randn(), disc: randn() };
  const profile: Record<string, number> = {};
  for (const trait of TRAIT_IDS) {
    const loads = LOADINGS[trait] ?? {};
    let value = 0;
    for (const [factor, w] of Object.entries(loads)) {
      value += (w as number) * z[factor as keyof typeof z];
    }
    // 16 puntos de desviación por factor + ruido propio del rasgo.
    profile[trait] = clamp(50 + value * 16 + randn() * 9);
  }
  return profile;
}

const NOMBRES = [
  "Lucía",
  "Hugo",
  "Martina",
  "Mateo",
  "Sofía",
  "Leo",
  "Julia",
  "Daniel",
  "Paula",
  "Pablo",
  "Emma",
  "Álvaro",
  "Valeria",
  "Adrián",
  "Carla",
  "Manuel",
  "Alba",
  "David",
  "Noa",
  "Mario",
  "Vega",
  "Diego",
  "Chloe",
  "Marco",
  "Irene",
  "Izan",
  "Jimena",
  "Bruno",
  "Laia",
  "Óliver",
];
const APELLIDOS = [
  "García",
  "Rodríguez",
  "Martínez",
  "López",
  "Sánchez",
  "Pérez",
  "Gómez",
  "Fernández",
  "Moreno",
  "Jiménez",
  "Ruiz",
  "Hernández",
  "Díaz",
  "Álvarez",
  "Muñoz",
  "Romero",
  "Alonso",
  "Gutiérrez",
  "Navarro",
  "Torres",
];

async function main() {
  console.log("Purgando seeds anteriores…");
  await prisma.user.deleteMany({ where: { isSeed: true } });

  console.log(`Generando ${N_USERS} perfiles sintéticos…`);
  const users = Array.from({ length: N_USERS }, (_, i) => ({
    id: `seed_${String(i).padStart(4, "0")}`,
    name: `${NOMBRES[Math.floor(rand() * NOMBRES.length)]} ${APELLIDOS[Math.floor(rand() * APELLIDOS.length)]}`,
    email: `seed-${i}@espejo.local`,
    isSeed: true,
  }));
  await prisma.user.createMany({ data: users });

  // Con 8 tests ya no todo el mundo los hace todos: cada test tiene su propia
  // probabilidad de estar completado, decreciente según el orden del catálogo.
  // Así los contadores de completitud y los tamaños de muestra por par de
  // rasgos se parecen a los de una app real.
  const TEST_COMPLETION: { traits: string[]; p: number }[] = TESTS.map((test, i) => ({
    traits: test.traits,
    p: Math.max(0.45, 0.97 - i * 0.07),
  }));

  const scores: { userId: string; trait: string; score: number }[] = [];
  for (const user of users) {
    const profile = generateProfile();
    const done = new Set<string>();
    for (const { traits, p } of TEST_COMPLETION) {
      if (rand() < p) traits.forEach((t) => done.add(t));
    }
    for (const [trait, score] of Object.entries(profile)) {
      if (!done.has(trait)) continue;
      scores.push({ userId: user.id, trait, score: Math.round(score * 10) / 10 });
    }
  }

  console.log(`Insertando ${scores.length} puntuaciones…`);
  for (let i = 0; i < scores.length; i += 2000) {
    await prisma.traitScore.createMany({ data: scores.slice(i, i + 2000) });
  }

  console.log("Seed completado ✔");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
