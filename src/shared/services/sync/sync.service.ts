import { logger } from "@/config/logger";
import { useSessionStore } from "@/shared/store/session.store";
import { useSyncStore } from "@/shared/store/sync.store";
import {
  groupDeletions,
  latestSyncedAt,
  toRemoteRow,
  withOverlap,
} from "@/shared/utils/sync-rows.utils";
import {
  applyRemoteRows,
  clearDeletions,
  hasLocalData,
  linkToUser,
  readChangedRows,
  readCursors,
  readDeletions,
  savePulledAt,
  savePushedAt,
  touchAllRows,
  wipeLocalData,
} from "./sync-local";
import {
  hasRemoteData,
  pullRows,
  pushDeletions,
  pushRows,
  softDeleteAll,
} from "./sync-remote";
import { SYNC_TABLES } from "./sync-tables";

/**
 * Sincronización en segundo plano. SQLite es la fuente de verdad y ninguna pantalla espera a esto:
 * primero se sube lo que cambió en el teléfono y después se baja lo que cambió en la cuenta.
 */

const PULL_OVERLAP_MS = 10_000;

export type KeepChoice = "phone" | "account";
type SyncResult = "synced" | "needsChoice" | "skipped";

async function pushChanges(since: number): Promise<void> {
  const startedAt = Date.now();
  for (const table of SYNC_TABLES) {
    const rows = readChangedRows(table, since).map((row) =>
      toRemoteRow(table, row),
    );
    await pushRows(table, rows);
  }
  for (const [table, { ids, deletedAt }] of groupDeletions(readDeletions())) {
    await pushDeletions(table, ids, deletedAt);
  }
  clearDeletions(startedAt);
  // Lo modificado mientras se subía tiene una hora igual o posterior: entra en la próxima vuelta.
  await savePushedAt(startedAt - 1);
}

async function pullChanges(cursor: string | null): Promise<void> {
  const since = withOverlap(cursor, PULL_OVERLAP_MS);
  let latest = cursor;
  for (const table of SYNC_TABLES) {
    const rows = await pullRows(table, since);
    applyRemoteRows(table, rows);
    latest = latestSyncedAt(latest, rows);
  }
  await savePulledAt(latest);
}

/** Primera vez con esta cuenta: si los dos lados tienen datos hay que preguntar; si no, se enlaza sin más. */
async function linkIfNeeded(userId: string): Promise<"linked" | "needsChoice"> {
  const { userId: linkedUserId } = await readCursors();
  if (linkedUserId === userId) return "linked";
  const hasLocal = hasLocalData();
  if (hasLocal && (await hasRemoteData())) return "needsChoice";
  // Un teléfono sin datos propios recibe lo de la cuenta tal cual.
  if (!hasLocal) wipeLocalData();
  await linkToUser(userId);
  return "linked";
}

async function runSync(): Promise<SyncResult> {
  const user = useSessionStore.getState().user;
  if (!user) return "skipped";
  if ((await linkIfNeeded(user.id)) === "needsChoice") return "needsChoice";
  const cursors = await readCursors();
  await pushChanges(cursors.pushedAt);
  await pullChanges(cursors.pulledAt);
  return "synced";
}

let running: Promise<void> | null = null;

async function runAndReport(work: () => Promise<SyncResult>): Promise<void> {
  const store = useSyncStore.getState();
  store.setStatus("syncing");
  try {
    const result = await work();
    if (result === "synced") store.markSynced(Date.now());
    else store.setStatus(result === "needsChoice" ? "needsChoice" : "idle");
  } catch (error) {
    logger.error("Sync failed", { error });
    store.setStatus("error");
  }
}

function start(work: () => Promise<SyncResult>): Promise<void> {
  running ??= runAndReport(work).finally(() => {
    running = null;
  });
  return running;
}

/** Sincroniza si hay sesión. Nunca rechaza: el resultado queda en `useSyncStore`. Dos llamadas a la vez comparten la misma vuelta. */
export function requestSync(): Promise<void> {
  return start(runSync);
}

/**
 * Resuelve el choque entre los datos del teléfono y los de la cuenta.
 * - "phone": lo del teléfono pasa a ser lo más reciente y lo que la cuenta tenía queda borrado.
 * - "account": se borran los datos del teléfono y se baja lo de la cuenta.
 */
export function resolveSyncChoice(keep: KeepChoice): Promise<void> {
  return start(async () => {
    const user = useSessionStore.getState().user;
    if (!user) return "skipped";
    if (keep === "account") {
      wipeLocalData();
    } else {
      const now = Date.now();
      // Un instante antes: así las filas del teléfono, marcadas con `now`, ganan y vuelven a quedar vivas.
      for (const table of SYNC_TABLES) await softDeleteAll(table, now - 1);
      touchAllRows(now);
    }
    await linkToUser(user.id);
    return runSync();
  });
}

/** Tras restaurar un respaldo: todo lo restaurado se vuelve a subir como lo más reciente. */
export function markAllForPush(): void {
  touchAllRows(Date.now());
}
