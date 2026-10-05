import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: [
    "./src/shared/db/schema/catalog.ts",
    "./src/shared/db/schema/plan.ts",
    "./src/shared/db/schema/training.ts",
    "./src/shared/db/schema/settings.ts",
    "./src/shared/db/schema/body.ts",
  ],
  out: "./src/shared/db/migrations",
});
