import { lte, sql, type SQLChunk } from "drizzle-orm";
import { logger } from "@/config/logger";
import { db, type Transaction } from "@/shared/db/client";
import {
  getAllSettings,
  saveSetting,
} from "@/shared/db/queries/settings.queries";
import { deletedRows } from "@/shared/db/schema";
import { SETTING_KEYS } from "@/shared/types/settings.types";
import { decideRemoteChange, toLocalRow } from "@/shared/utils/sync-rows.utils";
import {
  DATA_PROBE_TABLES,
  SYNC_TABLES,
  type SyncRow,
  type SyncTable,
} from "./sync-tables";

/** El lado SQLite de la sincronización. Todo es SQL directo con los nombres de columna reales (snake_case). */

const list = (parts: SQLChunk[]) => sql.join(parts, sql`, `);
const filterOf = (table: SyncTable) =>
  table.localFilter ? sql.raw(` AND ${table.localFilter}`) : sql``;
const columnsOf = (table: SyncTable) => ["id", ...table.columns, "updated_at"];

/** Filas del usuario modificadas después de `since` (ms). */
export function readChangedRows(table: SyncTable, since: number): SyncRow[] {
  const columns = list(
    columnsOf(table).map((column) => sql.identifier(column)),
  );
  return db.all<SyncRow>(
    sql`SELECT ${columns} FROM ${sql.identifier(table.local)} WHERE updated_at > ${since}${filterOf(table)}`,
  );
}

/** Inserta o actualiza sin borrar la fila (un REPLACE dispararía las cascadas sobre sus hijas). */
function upsertRow(tx: Transaction, table: SyncTable, row: SyncRow): void {
  const columns = Object.keys(row);
  const assignments = columns
    .filter((column) => column !== "id")
    .map(
      (column) =>
        sql`${sql.identifier(column)} = excluded.${sql.identifier(column)}`,
    );
  tx.run(sql`
    INSERT INTO ${sql.identifier(table.local)} (${list(columns.map((column) => sql.identifier(column)))})
    VALUES (${list(columns.map((column) => sql`${row[column]}`))})
    ON CONFLICT(id) DO UPDATE SET ${list(assignments)}`);
}

function applyRemoteRow(
  tx: Transaction,
  table: SyncTable,
  remote: SyncRow,
): void {
  const name = sql.identifier(table.local);
  const local = tx.get<{ updated_at: number }>(
    sql`SELECT updated_at FROM ${name} WHERE id = ${remote.id}`,
  );
  const change = decideRemoteChange(local?.updated_at ?? null, {
    updated_at: Number(remote.updated_at),
    deleted_at: remote.deleted_at === null ? null : Number(remote.deleted_at),
  });
  if (change === "delete")
    tx.run(sql`DELETE FROM ${name} WHERE id = ${remote.id}`);
  if (change === "upsert") upsertRow(tx, table, toLocalRow(table, remote));
}

/**
 * Aplica en el teléfono las filas bajadas de una tabla. Una fila que no se puede aplicar (por ejemplo,
 * apunta a un ejercicio que esta versión de la app no tiene) se registra y no detiene a las demás.
 */
export function applyRemoteRows(
  table: SyncTable,
  rows: readonly SyncRow[],
): void {
  if (rows.length === 0) return;
  db.transaction((tx) => {
    for (const row of rows) {
      try {
        applyRemoteRow(tx, table, row);
      } catch (error) {
        logger.warn("Skipped a row that could not be applied", {
          table: table.local,
          id: row.id,
          error,
        });
      }
    }
  });
}

export function readDeletions() {
  return db.select().from(deletedRows).all();
}

/** Los borrados ya avisados al servidor dejan de hacer falta. */
export function clearDeletions(until: number): void {
  db.delete(deletedRows).where(lte(deletedRows.deletedAt, until)).run();
}

/** Marca todas las filas del usuario como recién modificadas: la próxima subida las envía todas y ganan. */
export function touchAllRows(now: number): void {
  db.transaction((tx) => {
    for (const table of SYNC_TABLES) {
      tx.run(
        sql`UPDATE ${sql.identifier(table.local)} SET updated_at = ${now} WHERE 1 = 1${filterOf(table)}`,
      );
    }
  });
}

const INCREMENTS_TABLE = "equipment_increments";

/**
 * Deja el teléfono listo para recibir lo de la cuenta: borra los datos del usuario (no el catálogo ni los
 * ajustes), de hijos a padres. Los saltos de peso no se borran porque la app los necesita; quedan con
 * antigüedad cero para que los de la cuenta ganen y los de fábrica no se suban.
 */
export function wipeLocalData(): void {
  db.transaction((tx) => {
    for (const table of [...SYNC_TABLES].reverse()) {
      if (table.local === INCREMENTS_TABLE) continue;
      tx.run(
        sql`DELETE FROM ${sql.identifier(table.local)} WHERE 1 = 1${filterOf(table)}`,
      );
    }
    tx.run(sql`UPDATE ${sql.identifier(INCREMENTS_TABLE)} SET updated_at = 0`);
    tx.run(sql`DELETE FROM deleted_rows`);
  });
}

export function hasLocalData(): boolean {
  return DATA_PROBE_TABLES.some((table) => {
    const row = db.get<{ found: number }>(
      sql`SELECT 1 AS found FROM ${sql.identifier(table)} LIMIT 1`,
    );
    return row !== undefined;
  });
}

export interface SyncCursors {
  /** Cuenta a la que pertenecen los datos de este teléfono; null si nunca se enlazó. */
  userId: string | null;
  /** Hasta qué `updated_at` local (ms) ya se subió. */
  pushedAt: number;
  /** Hora de servidor de lo último que se bajó. */
  pulledAt: string | null;
}

export async function readCursors(): Promise<SyncCursors> {
  const all = await getAllSettings();
  return {
    userId: all[SETTING_KEYS.syncUserId] || null,
    pushedAt: Number(all[SETTING_KEYS.syncPushedAt]) || 0,
    pulledAt: all[SETTING_KEYS.syncPulledAt] || null,
  };
}

export async function savePushedAt(pushedAt: number): Promise<void> {
  await saveSetting(SETTING_KEYS.syncPushedAt, String(pushedAt));
}

export async function savePulledAt(pulledAt: string | null): Promise<void> {
  await saveSetting(SETTING_KEYS.syncPulledAt, pulledAt ?? "");
}

/** Enlaza el teléfono con una cuenta y deja los cursores a cero: la siguiente sincronización es completa. */
export async function linkToUser(userId: string): Promise<void> {
  await saveSetting(SETTING_KEYS.syncUserId, userId);
  await savePushedAt(0);
  await savePulledAt(null);
}
