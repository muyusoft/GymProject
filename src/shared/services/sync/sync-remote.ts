import { supabase } from "@/config/supabase";
import { chunk } from "@/shared/utils/chunk.utils";
import { DATA_PROBE_TABLES, type SyncRow, type SyncTable } from "./sync-tables";

/** El lado Supabase de la sincronización. RLS limita cada llamada a las filas del usuario con sesión. */

const UPSERT_BATCH = 500;
const ID_BATCH = 100;
const PAGE_SIZE = 1000;
const CONFLICT_TARGET = "user_id,id";

interface Failure {
  message: string;
}

function ensure(error: Failure | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`);
}

/** Sube filas; el servidor descarta por su cuenta las que sean más viejas que las que ya tiene. */
export async function pushRows(
  table: SyncTable,
  rows: readonly SyncRow[],
): Promise<void> {
  for (const part of chunk([...rows], UPSERT_BATCH)) {
    const { error } = await supabase
      .from(table.remote)
      .upsert(part, { onConflict: CONFLICT_TARGET });
    ensure(error, `Push ${table.remote}`);
  }
}

/** Avisa de filas borradas en el teléfono: en el servidor quedan marcadas, y sus hijas con ellas. */
export async function pushDeletions(
  remoteTable: string,
  ids: readonly string[],
  deletedAt: number,
): Promise<void> {
  for (const part of chunk([...ids], ID_BATCH)) {
    const { error } = await supabase
      .from(remoteTable)
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .in("id", part);
    ensure(error, `Delete ${remoteTable}`);
  }
}

/** Baja todo lo que cambió en una tabla después de `since` (hora de servidor), página a página. */
export async function pullRows(
  table: SyncTable,
  since: string,
): Promise<SyncRow[]> {
  const rows: SyncRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table.remote)
      .select("*")
      .gt("synced_at", since)
      .order("synced_at")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    ensure(error, `Pull ${table.remote}`);
    rows.push(...((data ?? []) as SyncRow[]));
    if ((data ?? []).length < PAGE_SIZE) return rows;
  }
}

/** Marca como borrado todo lo que la cuenta tiene en una tabla (al elegir quedarse con lo del teléfono). */
export async function softDeleteAll(
  table: SyncTable,
  deletedAt: number,
): Promise<void> {
  const { error } = await supabase
    .from(table.remote)
    .update({ deleted_at: deletedAt, updated_at: deletedAt })
    .is("deleted_at", null);
  ensure(error, `Clear ${table.remote}`);
}

export async function hasRemoteData(): Promise<boolean> {
  for (const table of DATA_PROBE_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    ensure(error, `Probe ${table}`);
    if ((count ?? 0) > 0) return true;
  }
  return false;
}
