// Prisma 7: la CLI ya no carga .env automáticamente ni lee config de
// package.json — todo vive aquí.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Prisma 7: la URL de conexión para la CLI (migrate, studio…) vive aquí; el
  // runtime usa el driver adapter en lib/prisma.ts.
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
