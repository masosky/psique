import { describe, expect, it } from "vitest";
import IntlMessageFormat from "intl-messageformat";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";
import { TESTS } from "@/lib/tests";
import { TRAIT_IDS, CATEGORIES } from "@/lib/traits";
import { INSIGHT_IDS } from "@/lib/insights";

// Every locale file is picked up automatically, so adding a language to
// routing without translating it fails here instead of at runtime.
// `import.meta.glob` is a Vite/vitest feature TypeScript doesn't type here.
const modules = import.meta.glob("../messages/*.json", { eager: true }) as unknown as Record<
  string,
  { default: object }
>;
const MESSAGES = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [
    path.replace(/.*\/(.+)\.json$/, "$1"),
    mod.default,
  ]),
) as Record<string, object>;

const BASE = DEFAULT_LOCALE;
const locales = Object.entries(MESSAGES);

/** Flattens a messages object into "a.b.c" paths. */
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

function at(messages: object, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, k) => (typeof acc === "object" && acc !== null ? (acc as never)[k] : undefined),
      messages,
    );
}

const has = (messages: object, path: string) => at(messages, path) !== undefined;

/**
 * ICU argument names used in a message: `{name}` and `{count, plural, …}`.
 * Only used to check that the base locale's arguments survive translation —
 * scanning the other direction would trip over words inside plural branches.
 */
function icuArgs(message: string): string[] {
  return [...message.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]);
}

const baseKeys = keyPaths(MESSAGES[BASE]);

describe("locale files", () => {
  it("there is one message file per configured locale", () => {
    expect(Object.keys(MESSAGES).sort()).toEqual([...LOCALES].sort());
  });

  it.each(locales.filter(([l]) => l !== BASE))(
    "%s has exactly the same keys as the base",
    (locale, msgs) => {
      const keys = keyPaths(msgs);
      expect(
        keys.filter((k) => !baseKeys.includes(k)),
        `extra keys in ${locale}`,
      ).toEqual([]);
      expect(
        baseKeys.filter((k) => !keys.includes(k)),
        `missing keys in ${locale}`,
      ).toEqual([]);
    },
  );

  it.each(locales)("%s has no empty values", (locale, msgs) => {
    for (const path of keyPaths(msgs)) {
      const value = at(msgs, path);
      expect(typeof value, `${locale}:${path}`).toBe("string");
      expect((value as string).trim().length, `${locale}:${path}`).toBeGreaterThan(0);
    }
  });

  it.each(locales)("%s parses as valid ICU", (locale, msgs) => {
    for (const path of keyPaths(msgs)) {
      const value = at(msgs, path) as string;
      // A malformed pattern (an unclosed plural branch, say) throws here
      // rather than blowing up the page that renders it.
      expect(() => new IntlMessageFormat(value, locale), `${locale}:${path}`).not.toThrow();
    }
  });

  it.each(locales.filter(([l]) => l !== BASE))("%s keeps every placeholder", (locale, msgs) => {
    for (const path of baseKeys) {
      const expected = icuArgs(at(MESSAGES[BASE], path) as string);
      if (expected.length === 0) continue;
      const actual = at(msgs, path) as string;
      for (const arg of expected) {
        expect(icuArgs(actual), `${locale}:${path} lost {${arg}}`).toContain(arg);
      }
    }
  });
});

describe("content coverage", () => {
  it.each(locales)("%s translates every trait", (locale, msgs) => {
    for (const trait of TRAIT_IDS) {
      for (const field of ["name", "short", "low", "high", "description"]) {
        expect(has(msgs, `traits.${trait}.${field}`), `${locale}: traits.${trait}.${field}`).toBe(
          true,
        );
      }
    }
  });

  it.each(locales)("%s translates every test, source note and statement", (locale, msgs) => {
    for (const test of TESTS) {
      for (const field of ["title", "tagline", "description"]) {
        expect(has(msgs, `tests.${test.slug}.${field}`), `${locale}: ${test.slug}.${field}`).toBe(
          true,
        );
      }
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
  });

  it.each(locales)("%s translates every insight", (locale, msgs) => {
    for (const id of INSIGHT_IDS) {
      expect(has(msgs, `insights.${id}.title`), `${locale}: insights.${id}.title`).toBe(true);
      expect(has(msgs, `insights.${id}.body`), `${locale}: insights.${id}.body`).toBe(true);
    }
  });

  it.each(locales)("%s translates every trait category", (locale, msgs) => {
    for (const cat of CATEGORIES) {
      expect(has(msgs, `categories.${cat}`), `${locale}: categories.${cat}`).toBe(true);
    }
  });

  it.each(locales)("%s translates the 9 political archetypes and every tier", (locale, msgs) => {
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
    for (const key of political) {
      expect(has(msgs, `archetypes.political.${key}.name`), `${locale}: ${key}`).toBe(true);
      expect(has(msgs, `archetypes.political.${key}.description`), `${locale}: ${key}`).toBe(true);
    }
    for (const group of ["dark", "pusilanime", "autoestima", "locus"]) {
      for (const tier of ["t1", "t2", "t3", "t4", "t5"]) {
        expect(has(msgs, `archetypes.${group}.${tier}.name`), `${locale}: ${group}.${tier}`).toBe(
          true,
        );
      }
    }
  });
});
