import { useCallback, useState } from "react";
import { logger } from "@/config/logger";
import type { AccountErrorCode } from "../types/account.types";
import { toAccountErrorCode } from "../utils/account-validation.utils";

interface AccountAction {
  /** Ejecuta la acción; devuelve false y deja el motivo en `errorCode` si falla. */
  run: (action: () => Promise<void>) => Promise<boolean>;
  isRunning: boolean;
  errorCode: AccountErrorCode | null;
}

export function useAccountAction(): AccountAction {
  const [isRunning, setIsRunning] = useState(false);
  const [errorCode, setErrorCode] = useState<AccountErrorCode | null>(null);

  const run = useCallback(async (action: () => Promise<void>) => {
    setIsRunning(true);
    setErrorCode(null);
    try {
      await action();
      return true;
    } catch (error) {
      const code = toAccountErrorCode(error);
      if (code === "unknown") logger.error("Account action failed", { error });
      else logger.info("Account action rejected", { code });
      setErrorCode(code);
      return false;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { run, isRunning, errorCode };
}
