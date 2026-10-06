import { eq, sql } from "drizzle-orm";
import { logger } from "@/config/logger";
import { SETTING_KEYS } from "@/shared/types/settings.types";
import type { Database, Transaction } from "./client";
import { settings } from "./schema";
import { buildSeedPlan } from "./seed/build-seed-plan";
import type { SeedInput } from "./seed/seed.types";

/** Sube al cambiar lo que hace la preparación, para que vuelva a correr en instalaciones ya preparadas. */
const PREP_VERSION = "1";

/** Tablas que apuntan a un ejercicio por su id. */
const EXERCISE_REFERENCES = [
  "plan_exercises",
  "set_logs",
  "exercise_swaps",
  "exercise_muscles",
] as const;

/**
 * Filas que quedaron sueltas mientras las claves foráneas estaban apagadas (por ejemplo, ejercicios de un
 * día del plan ya borrado). Con las claves encendidas esas filas harían fallar escrituras posteriores.
 */
function removeOrphans(tx: Transaction): void {
  tx.run(
    sql`DELETE FROM plan_days WHERE plan_id NOT IN (SELECT id FROM plans)`,
  );
  tx.run(
    sql`DELETE FROM plan_exercises WHERE plan_day_id NOT IN (SELECT id FROM plan_days)`,
  );
  tx.run(
    sql`DELETE FROM plan_exercises WHERE exercise_id NOT IN (SELECT id FROM exercises)`,
  );
  tx.run(
    sql`DELETE FROM exercise_swaps WHERE plan_exercise_id NOT IN (SELECT id FROM plan_exercises)`,
  );
  tx.run(
    sql`DELETE FROM exercise_swaps WHERE exercise_id NOT IN (SELECT id FROM exercises)`,
  );
  tx.run(sql`UPDATE sessions SET plan_day_id = NULL
             WHERE plan_day_id IS NOT NULL AND plan_day_id NOT IN (SELECT id FROM plan_days)`);
  tx.run(
    sql`DELETE FROM set_logs WHERE session_id NOT IN (SELECT id FROM sessions)`,
  );
  tx.run(
    sql`DELETE FROM set_logs WHERE exercise_id NOT IN (SELECT id FROM exercises)`,
  );
}

/**
 * Qué id estable le toca a cada ejercicio del catálogo ya sembrado con id al azar. Los de free-exercise-db
 * se reconocen por su id de origen; los propios, por nombre y patrón. Lo ambiguo (dos filas con el mismo
 * origen, o un id nuevo ya ocupado) se deja como está.
 */
function buildExerciseIdMap(tx: Transaction, input: SeedInput): void {
  tx.run(
    sql`CREATE TEMP TABLE exercise_id_map (old_id TEXT PRIMARY KEY, new_id TEXT NOT NULL UNIQUE)`,
  );
  tx.run(sql`
    INSERT INTO exercise_id_map (old_id, new_id)
    SELECT id, 'fedb:' || source_id FROM exercises
    WHERE source_id IS NOT NULL
      AND id <> 'fedb:' || source_id
      AND source_id IN (SELECT source_id FROM exercises GROUP BY source_id HAVING COUNT(*) = 1)
      AND 'fedb:' || source_id NOT IN (SELECT id FROM exercises)`);

  const ownExercises = buildSeedPlan(input).exercises.filter(
    (exercise) => !exercise.sourceId,
  );
  for (const { id, nameEs, pattern } of ownExercises) {
    tx.run(sql`
      INSERT OR IGNORE INTO exercise_id_map (old_id, new_id)
      SELECT id, ${id} FROM exercises
      WHERE source_id IS NULL AND name_es = ${nameEs} AND pattern IS ${pattern ?? null}
        AND id <> ${id} AND ${id} NOT IN (SELECT id FROM exercises)
      LIMIT 1`);
  }
}

function applyExerciseIdMap(tx: Transaction): void {
  for (const table of EXERCISE_REFERENCES) {
    const name = sql.identifier(table);
    tx.run(sql`
      UPDATE ${name}
      SET exercise_id = (SELECT new_id FROM exercise_id_map WHERE old_id = ${name}.exercise_id)
      WHERE exercise_id IN (SELECT old_id FROM exercise_id_map)`);
  }
  tx.run(sql`
    UPDATE exercises SET id = (SELECT new_id FROM exercise_id_map WHERE old_id = exercises.id)
    WHERE id IN (SELECT old_id FROM exercise_id_map)`);
  tx.run(sql`DROP TABLE exercise_id_map`);
}

/** Filas cuyo id sale de su clave natural: el salto por equipo y unidad, el peso por día, la sustitución por fecha. */
function stabilizeNaturalIds(tx: Transaction): void {
  tx.run(sql`
    UPDATE equipment_increments SET id = equipment || ':' || unit
    WHERE id <> equipment || ':' || unit
      AND (equipment, unit) IN (
        SELECT equipment, unit FROM equipment_increments GROUP BY equipment, unit HAVING COUNT(*) = 1
      )`);
  tx.run(sql`UPDATE body_weights SET id = date WHERE id <> date`);
  tx.run(sql`
    UPDATE exercise_swaps SET id = date || ':' || plan_exercise_id
    WHERE id <> date || ':' || plan_exercise_id`);
}

function isPrepared(db: Database): boolean {
  const row = db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, SETTING_KEYS.syncPrep))
    .get();
  return row?.value === PREP_VERSION;
}

/**
 * Deja la base lista para sincronizar: limpia filas sueltas y cambia los ids al azar por ids estables.
 * Corre una vez por instalación, después del seed, en una sola transacción (o entra todo o nada cambia).
 * Si falla se registra y la app sigue con los datos como estaban; se reintenta en el próximo arranque.
 */
export function runSyncPrep(db: Database, input: SeedInput): void {
  try {
    if (isPrepared(db)) return;
    db.transaction((tx) => {
      // Los ids de padres e hijos cambian en pasos separados: las claves foráneas se comprueban al final.
      tx.run(sql`PRAGMA defer_foreign_keys = ON`);
      removeOrphans(tx);
      buildExerciseIdMap(tx, input);
      applyExerciseIdMap(tx);
      stabilizeNaturalIds(tx);
      tx.insert(settings)
        .values({ key: SETTING_KEYS.syncPrep, value: PREP_VERSION })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: PREP_VERSION },
        })
        .run();
    });
  } catch (error) {
    logger.error("Sync preparation failed", { error });
  }
}
