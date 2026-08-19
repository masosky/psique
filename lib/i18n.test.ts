import { describe, expect, it } from "vitest";
import es from "@/messages/es.json";
import en from "@/messages/en.json";
import { TESTS } from "@/lib/tests";
import { TRAIT_IDS, CATEGORIES } from "@/lib/traits";
import { INSIGHT_IDS } from "@/lib/insights";

// Flattens a messages object into a set of "a.b.c" paths.
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

const esKeys = keyPaths(es);
const enKeys = keyPaths(en);

// Path-based access, to check that a specific key exists.
function has(messages: object, path: string): boolean {
  return (
    path
      .split(".")
      .reduce<unknown>(
        (acc, k) => (typeof acc === "object" && acc !== null ? (acc as never)[k] : undefined),
        messages,
      ) !== undefined
  );
}

describe("es/en messages", () => {
  it("have exactly the same keys", () => {
    expect(
      enKeys.filter((k) => !esKeys.includes(k)),
      "sobran en en.json",
    ).toEqual([]);
    expect(
      esKeys.filter((k) => !enKeys.includes(k)),
      "faltan en en.json",
    ).toEqual([]);
  });

  it("have no empty values", () => {
    for (const [locale, msgs] of [
      ["es", es],
      ["en", en],
    ] as const) {
      for (const path of keyPaths(msgs)) {
        const value = path
          .split(".")
          .reduce<unknown>((acc, k) => (acc as never)[k], msgs as unknown);
        expect(typeof value, `${locale}:${path}`).toBe("string");
        expect((value as string).trim().length, `${locale}:${path}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("content coverage", () => {
  const locales = [
    ["es", es],
    ["en", en],
  ] as const;

  it("every trait has name/short/low/high/description", () => {
    for (const [locale, msgs] of locales) {
      for (const trait of TRAIT_IDS) {
        for (const field of ["name", "short", "low", "high", "description"]) {
          expect(has(msgs, `traits.${trait}.${field}`), `${locale}: traits.${trait}.${field}`).toBe(
            true,
          );
        }
      }
    }
  });

  it("every test has title, tagline, description, and all its statements", () => {
    for (const [locale, msgs] of locales) {
      for (const test of TESTS) {
        for (const field of ["title", "tagline", "description"]) {
          expect(has(msgs, `tests.${test.slug}.${field}`), `${locale}: ${test.slug}.${field}`).toBe(
            true,
          );
        }
        // every source must have a translated note
        for (const source of test.sources) {
          expect(
            has(msgs, `tests.${test.slug}.sources.${source.noteKey}`),
            `${locale}: ${test.slug}.sources.${source.noteKey}`,
          ).toBe(true);
        }
        for (const item of test.items) {
          expect(
            has(msgs, `tests.${test.slug}.items.${item.id}`),
            `${locale}: ${test.slug}.items.${item.id}`,
          ).toBe(true);
        }
      }
    }
  });

  it("every insight has title and body", () => {
    for (const [locale, msgs] of locales) {
      for (const id of INSIGHT_IDS) {
        expect(has(msgs, `insights.${id}.title`), `${locale}: insights.${id}.title`).toBe(true);
        expect(has(msgs, `insights.${id}.body`), `${locale}: insights.${id}.body`).toBe(true);
      }
    }
  });

  it("every trait category is translated", () => {
    for (const [locale, msgs] of locales) {
      for (const cat of CATEGORIES) {
        expect(has(msgs, `categories.${cat}`), `${locale}: categories.${cat}`).toBe(true);
      }
    }
  });

  it("the 9 political archetypes and the 5 tiers of each index are translated", () => {
    const political = [
      "libertario-izq",
      "socialdemocrata",
      "socialismo-orden",
      "centrista-libertario",
      "centrista",
      "centrista-orden",
      "liberal-clasico",
      "liberal",
      "conservador-orden",
    ];
    for (const [locale, msgs] of locales) {
      for (const key of political) {
        expect(has(msgs, `archetypes.political.${key}.name`), `${locale}: ${key}`).toBe(true);
        expect(has(msgs, `archetypes.political.${key}.description`), `${locale}: ${key}`).toBe(
          true,
        );
      }
      for (const group of ["dark", "pusilanime"]) {
        for (const tier of ["t1", "t2", "t3", "t4", "t5"]) {
          expect(has(msgs, `archetypes.${group}.${tier}.name`), `${locale}: ${group}.${tier}`).toBe(
            true,
          );
        }
      }
    }
  });
});
