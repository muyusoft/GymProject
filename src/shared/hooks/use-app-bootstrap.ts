import { useEffect, useState } from "react";
import { logger } from "@/config/logger";
import type { SeedInput } from "@/shared/db/seed/seed.types";
import { useDatabaseReady } from "@/shared/db/use-database-ready";
import { configureNotifications, syncReminders } from "@/shared/services/reminders.service";
import { useSettingsStore } from "@/shared/store";
import { useAppFonts } from "./use-app-fonts";

interface BootstrapState {
  isReady: boolean;
  error: Error | null;
}

/** Fuentes, base de datos (migraciones + seed) y ajustes guardados, en ese orden, antes de mostrar la app. */
export function useAppBootstrap(seedInput: SeedInput): BootstrapState {
  const fonts = useAppFonts();
  const database = useDatabaseReady(seedInput);
  const hydrate = useSettingsStore((state) => state.hydrate);
  const isHydrated = useSettingsStore((state) => state.isHydrated);
  const [settingsError, setSettingsError] = useState<Error | null>(null);

  useEffect(() => {
    if (fonts.error) logger.error("Fonts failed to load", { error: fonts.error });
  }, [fonts.error]);

  useEffect(() => {
    if (!database.isReady) return;
    hydrate()
      .then(configureNotifications)
      .then(syncReminders)
      .catch((error: unknown) => {
      logger.error("Settings hydration failed", { error });

      let normalizedError: Error;
      if (error instanceof Error) {
        normalizedError = error;
      } else if (typeof error === "string") {
        normalizedError = new Error(error);
      } else {
        normalizedError = new Error(JSON.stringify(error) ?? "Unknown error");
      }

      setSettingsError(normalizedError);
    });
  }, [database.isReady, hydrate]);

  // Sin las fuentes la app sigue con la del sistema; sin base de datos no puede seguir.
  const areFontsSettled = fonts.isReady || fonts.error !== null;
  return {
    isReady: areFontsSettled && isHydrated,
    error: database.error ?? settingsError,
  };
}
