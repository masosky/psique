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
  it("neutral (all 3s) yields 50", () => {
    expect(scoreTest(mini, { i1: 3, i2: 3 })).toEqual({ openness: 50 });
  });

  it("max agreement with a direct and a reversed item cancels out", () => {
    // i1=5 pushes up, i2=5 (reversed -> 1) pushes down: mean (5+1)/2 = 3 -> 50
    expect(scoreTest(mini, { i1: 5, i2: 5 })).toEqual({ openness: 50 });
  });

  it("extreme high profile yields 100", () => {
    expect(scoreTest(mini, { i1: 5, i2: 1 })).toEqual({ openness: 100 });
  });

  it("extreme low profile yields 0", () => {
    expect(scoreTest(mini, { i1: 1, i2: 5 })).toEqual({ openness: 0 });
  });

  it("rejects incomplete answers", () => {
    expect(() => scoreTest(mini, { i1: 3 })).toThrow(ScoringError);
  });

  it("rejects out-of-range or non-integer values", () => {
    expect(() => scoreTest(mini, { i1: 0, i2: 3 })).toThrow(ScoringError);
    expect(() => scoreTest(mini, { i1: 6, i2: 3 })).toThrow(ScoringError);
    expect(() => scoreTest(mini, { i1: 2.5, i2: 3 })).toThrow(ScoringError);
  });

  it("rejects unknown items", () => {
    expect(() => scoreTest(mini, { i1: 3, i2: 3, hack: 3 })).toThrow(ScoringError);
  });
});

describe("values ipsatization", () => {
  const valores = TESTS.find((t) => t.slug === "valores")!;

  it("acquiescence does not inflate the profile: answering 5 to everything leaves every value at 50", () => {
    const answers = Object.fromEntries(valores.items.map((i) => [i.id, 5]));
    const scores = scoreTest(valores, answers);
    for (const trait of valores.traits) expect(scores[trait]).toBe(50);
  });

  it("a clear priority lands above 50 and the rest below", () => {
    // Max agreement with universalism (un1, un2), neutral on the rest.
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

describe("test catalog", () => {
  it("every trait used exists in the registry", () => {
    for (const test of TESTS) {
      for (const t of test.traits) expect(TRAITS[t], `${test.slug}: ${t}`).toBeDefined();
      for (const item of test.items) {
        for (const t of Object.keys(item.loadings)) {
          expect(TRAITS[t], `${test.slug}/${item.id}: ${t}`).toBeDefined();
        }
      }
    }
  });

  it("every item id is unique within its test", () => {
    for (const test of TESTS) {
      const ids = test.items.map((i) => i.id);
      expect(new Set(ids).size, test.slug).toBe(ids.length);
    }
  });

  it("every declared trait has at least one item, and scoring all-3s yields 50", () => {
    for (const test of TESTS) {
      const answers: Answers = Object.fromEntries(test.items.map((i) => [i.id, 3]));
      const scores = scoreTest(test, answers);
      for (const t of test.traits) {
        expect(scores[t], `${test.slug}: ${t}`).toBe(50);
      }
    }
  });

  it("every trait has items in both directions (acquiescence control)", () => {
    // Exception: the values test replicates Schwartz's PVQ format, which has
    // no reversed items (the original instrument corrects by centering per
    // person, not by reversing).
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
