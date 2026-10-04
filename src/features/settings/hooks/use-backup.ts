import { useCallback, useState } from "react";
import { logger } from "@/config/logger";
import { BackupError, type BackupFile, type BackupSummary } from "../types/backup.types";
import { exportBackup, pickBackup, restoreBackup } from "../services/backup.service";
import { summarizeBackup } from "../utils/backup.utils";

export interface BackupNotice {
  kind: "success" | "error";
  /** Clave de i18n y sus valores. */
  key: string;
  params?: Record<string, string | number>;
}

interface BackupState {
  isWorking: boolean;
  notice: BackupNotice | null;
  /** Archivo ya validado que espera la confirmación de la persona. */
  pending: { file: BackupFile; summary: BackupSummary } | null;
  exportData: () => Promise<void>;
  startImport: () => Promise<void>;
  confirmImport: () => Promise<void>;
  cancelImport: () => void;
}

function errorNotice(error: unknown): BackupNotice {
  const key = error instanceof BackupError ? `settings.data.errors.${error.code}` : "settings.data.errors.generic";
  return { kind: "error", key };
}

export function useBackup(): BackupState {
  const [isWorking, setIsWorking] = useState(false);
  const [notice, setNotice] = useState<BackupNotice | null>(null);
  const [pending, setPending] = useState<BackupState["pending"]>(null);

  /** Corre la acción con "trabajando"; un fallo se registra y se muestra traducido, nunca se pierde. */
  const run = useCallback(async (action: () => Promise<BackupNotice | null>) => {
    setIsWorking(true);
    setNotice(null);
    try {
      setNotice(await action());
    } catch (error) {
      logger.error("Backup action failed", { error });
      setNotice(errorNotice(error));
    } finally {
      setIsWorking(false);
    }
  }, []);

  const exportData = useCallback(
    () =>
      run(async () => {
        const result = await exportBackup(new Date());
        return result ? { kind: "success", key: "settings.data.exported", params: { file: result.fileName } } : null;
      }),
    [run],
  );

  const startImport = useCallback(
    () =>
      run(async () => {
        const file = await pickBackup();
        if (file) setPending({ file, summary: summarizeBackup(file) });
        return null;
      }),
    [run],
  );

  const confirmImport = useCallback(async () => {
    if (!pending) return;
    await run(async () => {
      const summary = await restoreBackup(pending.file);
      setPending(null);
      return { kind: "success", key: "settings.data.imported", params: { sessions: summary.sessions, days: summary.days } };
    });
  }, [pending, run]);

  return { isWorking, notice, pending, exportData, startImport, confirmImport, cancelImport: () => setPending(null) };
}
