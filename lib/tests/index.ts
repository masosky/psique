import type { TestDefinition } from "./types";
import { espectroPolitico } from "./espectro-politico";
import { bigFive } from "./big-five";
import { moral } from "./moral";
import { valores } from "./valores";
import { apego } from "./apego";
import { honestidad } from "./honestidad";
import { ladoOscuro } from "./lado-oscuro";
import { asertividad } from "./asertividad";
import { inteligenciaEmocional } from "./inteligencia-emocional";
import { humor } from "./humor";
import { autoestima } from "./autoestima";
import { locus } from "./locus";

export type { TestDefinition, TestItem, TestSource } from "./types";

// Orden = orden recomendado en el catálogo. El político es el mejor gancho;
// autoestima va pronto porque es corta y personal; el humor airea la mitad;
// los de carácter (oscuro, asertividad, honestidad) cierran con los cruces
// más jugosos ya desbloqueables.
export const TESTS: TestDefinition[] = [
  espectroPolitico,
  bigFive,
  autoestima,
  moral,
  valores,
  apego,
  inteligenciaEmocional,
  humor,
  ladoOscuro,
  asertividad,
  honestidad,
  locus,
];

export const TESTS_BY_SLUG: Record<string, TestDefinition> = Object.fromEntries(
  TESTS.map((t) => [t.slug, t]),
);

export function getTest(slug: string): TestDefinition | undefined {
  return TESTS_BY_SLUG[slug];
}
