import type { TestDefinition } from "@/lib/tests/types";
import { clamp } from "@/lib/utils";

// Respuestas de un intento: itemId -> valor Likert 1..5.
export type Answers = Record<string, number>;

// Puntuaciones resultantes: traitId -> 0..100.
export type Scores = Record<string, number>;

export const LIKERT_MIN = 1;
export const LIKERT_MAX = 5;

export class ScoringError extends Error {}

/**
 * Puntúa un test completo.
 *
 * Para cada rasgo que mide el test: toma sus ítems, invierte los de carga
 * negativa (v -> 6 - v), promedia y normaliza la media 1..5 a 0..100.
 * Con ítems equilibrados en ambas direcciones, responder "3" a todo deja el
 * rasgo en 50 (el centro).
 */
export function scoreTest(test: TestDefinition, answers: Answers): Scores {
  // Validación: todos los ítems respondidos, valores Likert válidos, sin extras.
  for (const item of test.items) {
    const v = answers[item.id];
    if (v === undefined) throw new ScoringError(`Falta la respuesta al ítem ${item.id}`);
    if (!Number.isInteger(v) || v < LIKERT_MIN || v > LIKERT_MAX) {
      throw new ScoringError(`Respuesta inválida en ${item.id}: ${v}`);
    }
  }
  const known = new Set(test.items.map((i) => i.id));
  for (const key of Object.keys(answers)) {
    if (!known.has(key)) throw new ScoringError(`Ítem desconocido: ${key}`);
  }

  const scores: Scores = {};
  for (const trait of test.traits) {
    const values: number[] = [];
    for (const item of test.items) {
      const loading = item.loadings[trait];
      if (loading === undefined) continue;
      const raw = answers[item.id];
      values.push(loading > 0 ? raw : LIKERT_MAX + LIKERT_MIN - raw);
    }
    if (values.length === 0) continue;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    scores[trait] = clamp(((mean - LIKERT_MIN) / (LIKERT_MAX - LIKERT_MIN)) * 100);
  }
  return scores;
}
