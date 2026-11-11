import { router } from "expo-router";
import { useCallback } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { reopenSession } from "../services/session-reopen.service";

interface ReopenSession {
  reopen: () => Promise<void>;
  isReopening: boolean;
  hasError: boolean;
}

/** Reabrir el entreno terminado de hoy y entrar a la sesión. */
export function useReopenSession(sessionId: string): ReopenSession {
  const { run, isRunning, hasError } = useActionRunner();

  const reopen = useCallback(async () => {
    const isReopened = await run(() => reopenSession(sessionId, new Date()));
    if (isReopened) router.push({ pathname: "/session/[id]", params: { id: sessionId } });
  }, [run, sessionId]);

  return { reopen, isReopening: isRunning, hasError };
}
