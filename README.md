# Psique

Quantified self-knowledge. Every test fills a trait profile that never resets;
the profile pays you back with insights, percentiles and correlations against
the community.

**12 tests · 46 traits · 181 questions · 60 insights · 35 scientific references · es/en**

## Getting started

```bash
docker compose up -d          # Postgres on port 5433
cp .env.template .env         # and generate AUTH_SECRET: openssl rand -base64 32
yarn install
yarn prisma:migrate
yarn prisma:seed              # 420 synthetic calibration profiles
yarn dev
```

## Architecture

Next.js (App Router) + Prisma + Postgres, NextAuth v5 with credentials,
next-intl with `[locale]` routing.

| Path                    | What it is                                                 |
| ----------------------- | ---------------------------------------------------------- |
| `lib/traits.ts`         | Trait registry: just id, category and polarity             |
| `lib/tests/*.ts`        | Each test's definition: item ids, loadings and sources     |
| `lib/scoring.ts`        | Likert 1-5 → 0-100 per trait, with reversed items          |
| `lib/insights.ts`       | Declarative rules over the trait vector                    |
| `lib/population.ts`     | Percentiles and Pearson correlations, in SQL               |
| `lib/theme.ts`          | Single source of truth for colors (CSS vars + charts + OG) |
| `messages/{es,en}.json` | **All** copy: UI, item statements, traits, insights        |

`lib/` is pure and returns ids; text resolves in the pages. That is why adding a
test means writing one file in `lib/tests/` plus its copy in the two JSONs — no
migration involved.

## Stack notes

- **Prisma 7**: the connection URL lives in `prisma.config.ts`, not in the
  schema. The client is generated into `lib/generated/prisma` and talks to
  Postgres through `@prisma/adapter-pg`.
- **TypeScript 5.9**, not 7: `typescript-eslint` does not support the native
  compiler yet.
- **ESLint 9**, not 10: `eslint-config-next` is not compatible with 10 yet.

## Verifying

```bash
yarn verify
```

Lint, typecheck and tests. One of the tests asserts that `es.json` and
`en.json` have exactly the same keys and that every trait, test, item, insight
and source is translated in both: an untranslated string breaks the page at
runtime, so it fails earlier here.
