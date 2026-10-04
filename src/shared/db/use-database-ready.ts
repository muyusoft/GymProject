import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";
import { logger } from "@/config/logger";
import { db } from "./client";
import migrations from "./migrations/migrations";
import { runSeed } from "./seed";
import type { SeedInput } from "./seed/seed.types";

interface DatabaseState {
  isReady: boolean;
  error: Error | null;
}

/** Aplica las migraciones y luego corre el seed (una sola vez). */
export function useDatabaseReady(seedInput: SeedInput): DatabaseState {
  const { success, error: migrationError } = useMigrations(db, migrations);
  const [isSeeded, setIsSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    runSeed(db, seedInput)
      .then(() => setIsSeeded(true))
      .catch((error: unknown) => {
        logger.error("Database seed failed", { error });
        setSeedError(error instanceof Error ? error : new Error(String(error)));
      });
  }, [success, seedInput]);

  return { isReady: isSeeded, error: migrationError ?? seedError };
}
