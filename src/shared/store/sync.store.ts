import { create } from "zustand";

/**
 * "needsChoice": el teléfono y la cuenta tienen datos distintos y la persona debe elegir con cuál se queda.
 */
export type SyncStatus = "idle" | "syncing" | "needsChoice" | "error";

interface SyncState {
  status: SyncStatus;
  /** Cuándo terminó bien la última sincronización de esta sesión de la app (ms); null si aún ninguna. */
  lastSyncedAt: number | null;
  setStatus: (status: SyncStatus) => void;
  markSynced: (at: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: "idle",
  lastSyncedAt: null,
  setStatus: (status) => set({ status }),
  markSynced: (at) => set({ status: "idle", lastSyncedAt: at }),
}));
