import type { TestDefinition } from "./types";
import { espectroPolitico } from "./espectro-politico";
import { bigFive } from "./big-five";
import { moral } from "./moral";
import { valores } from "./valores";
import { apego } from "./apego";
import { honestidad } from "./honestidad";
import { ladoOscuro } from "./lado-oscuro";
import { asertividad } from "./asertividad";

export type { TestDefinition, TestItem, TestSource } from "./types";

// Orden = orden recomendado en el catálogo. Big Five primero desbloquea más
// insights cruzados que ningún otro, pero el político es el mejor gancho.
export const TESTS: TestDefinition[] = [
  espectroPolitico,
  bigFive,
  moral,
  valores,
  apego,
  ladoOscuro,
  asertividad,
  honestidad,
];

export const TESTS_BY_SLUG: Record<string, TestDefinition> = Object.fromEntries(
  TESTS.map((t) => [t.slug, t]),
);

export function getTest(slug: string): TestDefinition | undefined {
  return TESTS_BY_SLUG[slug];
}
