import { create } from "zustand";

/**
 * "needsChoice": el teléfono y la cuenta tienen datos distintos y la persona debe elegir con cuál se queda.
 */
export type SyncStatus = "idle" | "syncing" | "needsChoice" | "error";

interface SyncState {
  status: SyncStatus;
  /** Cuándo terminó bien la última sincronización de esta sesión de la app (ms); null si aún ninguna. */
  lastSyncedAt: number | null;
  /** Sube cada vez que la sincronización cambia datos del teléfono; las pantallas lo usan para recargarse. */
  dataVersion: number;
  /** Se están bajando los datos de la cuenta a un teléfono vacío: las pantallas muestran carga, no un vacío. */
  isRestoring: boolean;
  setStatus: (status: SyncStatus) => void;
  markSynced: (at: number) => void;
  markDataChanged: () => void;
  setRestoring: (isRestoring: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: "idle",
  lastSyncedAt: null,
  dataVersion: 0,
  isRestoring: false,
  setStatus: (status) => set({ status }),
  markSynced: (at) => set({ status: "idle", lastSyncedAt: at }),
  markDataChanged: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
  setRestoring: (isRestoring) => set({ isRestoring }),
}));
