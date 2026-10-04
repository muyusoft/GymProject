import { eq } from "drizzle-orm";
import { SETTING_KEYS } from "@/shared/types/settings.types";
import { chunk } from "@/shared/utils/chunk.utils";
import type { Database } from "./client";
import { buildSeedPlan } from "./seed/build-seed-plan";
import type { SeedInput } from "./seed/seed.types";
import {
  equipmentIncrements,
  exerciseMuscles,
  exercises,
  settings,
  sources,
} from "./schema";

/** Filas por INSERT: SQLite limita las variables por sentencia (999 en builds antiguos). */
const INSERT_BATCH_SIZE = 50;
const SEEDED_VALUE = "1";

async function isSeeded(db: Database): Promise<boolean> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, SETTING_KEYS.seeded));
  return rows.length > 0;
}

/** Carga el catálogo, las fuentes y los saltos por defecto. Corre una sola vez. */
export async function runSeed(db: Database, input: SeedInput): Promise<void> {
  if (await isSeeded(db)) return;
  const plan = buildSeedPlan(input);

  await db.transaction(async (tx) => {
    await tx.insert(sources).values(plan.sources);
    for (const rows of chunk(plan.exercises, INSERT_BATCH_SIZE)) {
      await tx.insert(exercises).values(rows);
    }
    for (const rows of chunk(plan.muscles, INSERT_BATCH_SIZE)) {
      await tx.insert(exerciseMuscles).values(rows);
    }
    await tx.insert(equipmentIncrements).values(plan.increments);
    await tx
      .insert(settings)
      .values({ key: SETTING_KEYS.seeded, value: SEEDED_VALUE });
  });
}
