import { and, eq, sql } from "drizzle-orm";
import type { Transaction } from "../client";
import { deletedRows } from "../schema";

/** Tablas con datos del usuario que se sincronizan; el nombre es el de la tabla en SQLite. */
export const SYNCED_TABLES = [
  "plans",
  "plan_days",
  "plan_exercises",
  "sessions",
  "set_logs",
  "exercise_swaps",
  "body_weights",
] as const;
export type SyncedTable = (typeof SYNCED_TABLES)[number];

/**
 * Anota que esas filas se borran. Va en la misma transacción que el borrado: o pasan las dos cosas o ninguna.
 * Las filas hijas que caen por cascada no se anotan; el servidor aplica la misma cascada al recibir la del padre.
 */
export function recordDeletions(
  tx: Transaction,
  table: SyncedTable,
  ids: readonly string[],
): void {
  const deletedAt = Date.now();
  for (const rowId of ids) {
    tx.insert(deletedRows)
      .values({ tableName: table, rowId, deletedAt })
      .onConflictDoUpdate({
        target: [deletedRows.tableName, deletedRows.rowId],
        set: { deletedAt },
      })
      .run();
  }
}

/** Anota todas las filas de una tabla antes de vaciarla (restaurar un respaldo). */
export function recordAllDeletions(tx: Transaction, table: SyncedTable): void {
  tx.run(
    sql`INSERT OR REPLACE INTO deleted_rows (table_name, row_id, deleted_at)
        SELECT ${table}, id, ${Date.now()} FROM ${sql.identifier(table)}`,
  );
}

/** Tras restaurar un respaldo: las filas que volvieron con el mismo id dejan de estar borradas. */
export function clearRestoredDeletions(
  tx: Transaction,
  table: SyncedTable,
): void {
  tx.run(
    sql`DELETE FROM deleted_rows
        WHERE table_name = ${table} AND row_id IN (SELECT id FROM ${sql.identifier(table)})`,
  );
}

/** Una fila con id estable que se vuelve a crear (el peso de un día, una sustitución) deja de estar borrada. */
export function clearDeletion(
  tx: Transaction,
  table: SyncedTable,
  id: string,
): void {
  tx.delete(deletedRows)
    .where(and(eq(deletedRows.tableName, table), eq(deletedRows.rowId, id)))
    .run();
}
