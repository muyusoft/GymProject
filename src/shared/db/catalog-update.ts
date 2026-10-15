import { eq, inArray, sql } from "drizzle-orm";
import { logger } from "@/config/logger";
import { SETTING_KEYS } from "@/shared/types/settings.types";
import { chunk } from "@/shared/utils/chunk.utils";
import type { Database } from "./client";
import { exerciseMuscles, exercises, settings } from "./schema";
import { buildCatalogUpdate } from "./seed/build-catalog-update";
import type { SeedInput } from "./seed/seed.types";

/** Sube cuando cambian los ejercicios comunes (common-exercises.json) para que llegue a quien ya tiene la app. */
const CATALOG_VERSION = "2";
const INSERT_BATCH_SIZE = 50;
const ID_BATCH_SIZE = 500;

function isCurrent(db: Database): boolean {
  const row = db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, SETTING_KEYS.catalogVersion))
    .get();
  return row?.value === CATALOG_VERSION;
}

/**
 * Pone al día los ejercicios comunes en instalaciones que ya tenían el catálogo: agrega los nuevos, actualiza
 * patrón, equipo y requisitos, y rehace sus músculos. El historial no se toca: los ids son estables.
 * Corre una vez por versión, en una transacción; si falla se registra y se reintenta en el próximo arranque.
 */
export function runCatalogUpdate(db: Database, input: SeedInput): void {
  try {
    if (isCurrent(db)) return;
    const update = buildCatalogUpdate(input);
    const ids = update.exercises.map((exercise) => exercise.id);
    db.transaction((tx) => {
      for (const rows of chunk(update.exercises, INSERT_BATCH_SIZE)) {
        tx.insert(exercises)
          .values(rows)
          .onConflictDoUpdate({
            target: exercises.id,
            set: {
              nameEs: sql`excluded.name_es`,
              pattern: sql`excluded.pattern`,
              requires: sql`excluded.requires`,
              equipment: sql`excluded.equipment`,
              defaultLoadType: sql`excluded.default_load_type`,
              evidenceLevel: sql`excluded.evidence_level`,
            },
          })
          .run();
      }
      for (const part of chunk(ids, ID_BATCH_SIZE)) {
        tx.delete(exerciseMuscles).where(inArray(exerciseMuscles.exerciseId, part)).run();
      }
      for (const rows of chunk(update.muscles, INSERT_BATCH_SIZE)) tx.insert(exerciseMuscles).values(rows).run();
      tx.insert(settings)
        .values({ key: SETTING_KEYS.catalogVersion, value: CATALOG_VERSION })
        .onConflictDoUpdate({ target: settings.key, set: { value: CATALOG_VERSION } })
        .run();
    });
  } catch (error) {
    logger.error("Catalog update failed", { error });
  }
}
