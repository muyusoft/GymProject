/** Reglas puras de la sincronización: cómo se traduce una fila y quién gana cuando las dos partes la tienen. */

type Row = Record<string, unknown>;

interface RowShape {
  columns: readonly string[];
  booleans?: readonly string[];
}

const EPOCH = "1970-01-01T00:00:00.000Z";

function pick(
  shape: RowShape,
  source: Row,
  convert: (value: unknown) => unknown,
): Row {
  const booleans = new Set(shape.booleans ?? []);
  const entries = shape.columns.map((column) => {
    const value = source[column] ?? null;
    return [
      column,
      booleans.has(column) && value !== null ? convert(value) : value,
    ];
  });
  return Object.fromEntries(entries);
}

/** Fila de SQLite → fila para subir: solo las columnas acordadas, booleanos de verdad y sin marca de borrado. */
export function toRemoteRow(shape: RowShape, local: Row): Row {
  return {
    id: local.id,
    ...pick(shape, local, (value) => value === 1 || value === true),
    updated_at: local.updated_at,
    deleted_at: null,
  };
}

/** Fila bajada → fila para SQLite: solo las columnas acordadas y booleanos como 0/1. */
export function toLocalRow(shape: RowShape, remote: Row): Row {
  return {
    id: remote.id,
    ...pick(shape, remote, (value) => (value === true || value === 1 ? 1 : 0)),
    updated_at: remote.updated_at,
  };
}

export type RemoteChange = "upsert" | "delete" | "skip";

interface RemoteVersion {
  updated_at: number;
  deleted_at: number | null;
}

/**
 * Qué hacer en el teléfono con una fila bajada. Gana la modificación más reciente: si la fila local es
 * igual de nueva o más (incluido el eco de lo que se acaba de subir), no se toca.
 */
export function decideRemoteChange(
  localUpdatedAt: number | null,
  remote: RemoteVersion,
): RemoteChange {
  if (localUpdatedAt !== null && localUpdatedAt >= remote.updated_at)
    return "skip";
  if (remote.deleted_at === null) return "upsert";
  return localUpdatedAt === null ? "skip" : "delete";
}

/** La hora de servidor más reciente entre el cursor actual y las filas bajadas. */
export function latestSyncedAt(
  current: string | null,
  rows: readonly Row[],
): string | null {
  return rows.reduce<string | null>((latest, row) => {
    const syncedAt = typeof row.synced_at === "string" ? row.synced_at : null;
    if (syncedAt === null) return latest;
    return latest === null || Date.parse(syncedAt) > Date.parse(latest)
      ? syncedAt
      : latest;
  }, current);
}

/**
 * Desde cuándo pedir cambios: un poco antes del cursor, porque dos escrituras casi simultáneas pueden
 * confirmarse en desorden. Repetir filas no daña nada; saltarse una sí.
 */
export function withOverlap(cursor: string | null, overlapMs: number): string {
  if (cursor === null) return EPOCH;
  const time = Date.parse(cursor);
  return Number.isNaN(time)
    ? EPOCH
    : new Date(Math.max(time - overlapMs, 0)).toISOString();
}

/** Agrupa los borrados por tabla: ids y la hora del más reciente. */
export function groupDeletions(
  deletions: readonly { tableName: string; rowId: string; deletedAt: number }[],
): Map<string, { ids: string[]; deletedAt: number }> {
  const byTable = new Map<string, { ids: string[]; deletedAt: number }>();
  for (const { tableName, rowId, deletedAt } of deletions) {
    const group = byTable.get(tableName) ?? { ids: [], deletedAt: 0 };
    group.ids.push(rowId);
    group.deletedAt = Math.max(group.deletedAt, deletedAt);
    byTable.set(tableName, group);
  }
  return byTable;
}
