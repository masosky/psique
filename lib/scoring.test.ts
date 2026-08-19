import { describe, expect, it } from "vitest";
import { scoreTest, ScoringError, type Answers } from "@/lib/scoring";
import type { TestDefinition } from "@/lib/tests/types";
import { TESTS } from "@/lib/tests";
import { TRAITS } from "@/lib/traits";

const mini: TestDefinition = {
  slug: "mini",
  version: 1,
  emoji: "🧪",
  category: "personalidad",
  traits: ["openness"],
  minutes: 1,
  sources: [],
  items: [
    { id: "i1", loadings: { openness: 1 } },
    { id: "i2", loadings: { openness: -1 } },
  ],
};

describe("scoreTest", () => {
  it("neutral (todo 3) da 50", () => {
    expect(scoreTest(mini, { i1: 3, i2: 3 })).toEqual({ openness: 50 });
  });

  it("máximo acuerdo con ítem directo e inverso se compensan", () => {
    // i1=5 sube, i2=5 (invertido -> 1) baja: media (5+1)/2 = 3 -> 50
    expect(scoreTest(mini, { i1: 5, i2: 5 })).toEqual({ openness: 50 });
  });

  it("perfil extremo alto da 100", () => {
    expect(scoreTest(mini, { i1: 5, i2: 1 })).toEqual({ openness: 100 });
  });

  it("perfil extremo bajo da 0", () => {
    expect(scoreTest(mini, { i1: 1, i2: 5 })).toEqual({ openness: 0 });
  });

  it("rechaza respuestas incompletas", () => {
    expect(() => scoreTest(mini, { i1: 3 })).toThrow(ScoringError);
  });

  it("rechaza valores fuera de rango o no enteros", () => {
    expect(() => scoreTest(mini, { i1: 0, i2: 3 })).toThrow(ScoringError);
    expect(() => scoreTest(mini, { i1: 6, i2: 3 })).toThrow(ScoringError);
    expect(() => scoreTest(mini, { i1: 2.5, i2: 3 })).toThrow(ScoringError);
  });

  it("rechaza ítems desconocidos", () => {
    expect(() => scoreTest(mini, { i1: 3, i2: 3, hack: 3 })).toThrow(ScoringError);
  });
});

describe("ipsatización de valores", () => {
  const valores = TESTS.find((t) => t.slug === "valores")!;

  it("la aquiescencia no infla el perfil: responder 5 a todo deja cada valor en 50", () => {
    const answers = Object.fromEntries(valores.items.map((i) => [i.id, 5]));
    const scores = scoreTest(valores, answers);
    for (const trait of valores.traits) expect(scores[trait]).toBe(50);
  });

  it("una prioridad clara queda por encima de 50 y el resto por debajo", () => {
    // Máximo acuerdo con universalismo (un1, un2), neutral en el resto.
    const answers = Object.fromEntries(
      valores.items.map((i) => [i.id, i.id.startsWith("un") ? 5 : 3]),
    );
    const scores = scoreTest(valores, answers);
    expect(scores.univers).toBeGreaterThan(50);
    for (const trait of valores.traits.filter((t) => t !== "univers")) {
      expect(scores[trait], trait).toBeLessThan(50);
      expect(scores.univers).toBeGreaterThan(scores[trait]);
    }
  });
});

describe("catálogo de tests", () => {
  it("todos los rasgos usados existen en el registro", () => {
    for (const test of TESTS) {
      for (const t of test.traits) expect(TRAITS[t], `${test.slug}: ${t}`).toBeDefined();
      for (const item of test.items) {
        for (const t of Object.keys(item.loadings)) {
          expect(TRAITS[t], `${test.slug}/${item.id}: ${t}`).toBeDefined();
        }
      }
    }
  });

  it("todos los ítems tienen id único dentro de su test", () => {
    for (const test of TESTS) {
      const ids = test.items.map((i) => i.id);
      expect(new Set(ids).size, test.slug).toBe(ids.length);
    }
  });

  it("cada rasgo declarado tiene al menos un ítem, y puntuar todo-3 da 50", () => {
    for (const test of TESTS) {
      const answers: Answers = Object.fromEntries(test.items.map((i) => [i.id, 3]));
      const scores = scoreTest(test, answers);
      for (const t of test.traits) {
        expect(scores[t], `${test.slug}: ${t}`).toBe(50);
      }
    }
  });

  it("cada rasgo tiene ítems en ambas direcciones (control de aquiescencia)", () => {
    // Excepción: el test de valores replica el formato PVQ de Schwartz, que no
    // usa ítems invertidos (el instrumento original corrige centrando por
    // persona, no invirtiendo).
    for (const test of TESTS.filter((t) => t.slug !== "valores")) {
      for (const trait of test.traits) {
        const dirs = new Set(
          test.items.flatMap((i) => (i.loadings[trait] !== undefined ? [i.loadings[trait]] : [])),
        );
        expect(dirs, `${test.slug}: ${trait}`).toEqual(new Set([1, -1]));
      }
    }
  });
});
