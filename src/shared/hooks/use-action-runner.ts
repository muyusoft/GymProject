import { useCallback, useState } from "react";
import { logger } from "@/config/logger";

interface ActionRunner {
  /** Ejecuta la acción; devuelve false (y registra el error) si falla, para que la pantalla avise. */
  run: (action: () => Promise<unknown>) => Promise<boolean>;
  isRunning: boolean;
  hasError: boolean;
}

export function useActionRunner(): ActionRunner {
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setIsRunning(true);
    setHasError(false);
    try {
      await action();
      return true;
    } catch (error) {
      logger.error("Action failed", { error });
      setHasError(true);
      return false;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { run, isRunning, hasError };
}
