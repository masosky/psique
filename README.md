# Espejo

Autoconocimiento cuantificado. Cada test rellena un perfil de rasgos que ya no se
vacía; el perfil devuelve insights, percentiles y correlaciones contra la comunidad.

**12 tests · 46 rasgos · 181 preguntas · 60 insights · 35 referencias científicas · es/en**

## Arranque

```bash
docker compose up -d          # Postgres en el puerto 5433
cp .env.template .env         # y genera AUTH_SECRET: openssl rand -base64 32
yarn install
yarn prisma:migrate
yarn prisma:seed              # 420 perfiles sintéticos de calibración
yarn dev
```

## Arquitectura

Misma base que somelye, sin Redis ni Qdrant: Next.js (App Router) + Prisma + Postgres,
NextAuth v5 con credenciales, next-intl con routing `[locale]`.

| Ruta                    | Qué es                                                   |
| ----------------------- | -------------------------------------------------------- |
| `lib/traits.ts`         | Registro de rasgos: solo id, categoría y polaridad       |
| `lib/tests/*.ts`        | Definición de cada test: ids, cargas por rasgo y fuentes |
| `lib/scoring.ts`        | Likert 1-5 → 0-100 por rasgo, con ítems invertidos       |
| `lib/insights.ts`       | Reglas declarativas sobre el vector de rasgos            |
| `lib/population.ts`     | Percentiles y correlaciones de Pearson, en SQL           |
| `messages/{es,en}.json` | **Todo** el texto: UI, enunciados, rasgos, insights      |

`lib/` es puro y devuelve ids; el texto se resuelve en las páginas. Por eso añadir un
test es escribir un fichero en `lib/tests/` y sus textos en los dos JSON — sin migración.

## Notas del stack

- **Prisma 7**: la URL de conexión va en `prisma.config.ts`, no en el schema. El cliente
  se genera en `lib/generated/prisma` y habla con Postgres vía `@prisma/adapter-pg`.
- **TypeScript 5.9**, no 7: `typescript-eslint` aún no soporta el compilador nativo.
- **ESLint 9**, no 10: `eslint-config-next` todavía no es compatible con la 10.

## Verificar

```bash
yarn verify
```

Lint, typecheck y tests. Entre los tests hay uno que comprueba que `es.json` y `en.json`
tienen exactamente las mismas claves y que cada rasgo, test, ítem, insight y fuente está
traducido en ambos: un texto sin traducir rompe la página en runtime, así que falla antes.
