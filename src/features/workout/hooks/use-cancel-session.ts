import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { cancelSession } from "../services/session-write.service";
import type { SessionView } from "../types/workout.types";
import { countDoneSets } from "../utils/session-stats.utils";

interface CancelSession {
  /** Pide confirmación y, si se acepta, descarta la sesión y vuelve a Hoy. */
  cancel: () => void;
  hasError: boolean;
}

/** Cancelar un entreno empezado por error: la sesión y sus series se descartan; el plan no cambia. */
export function useCancelSession(
  sessionId: string,
  view: SessionView | null,
): CancelSession {
  const { t } = useTranslation();
  const { run, hasError } = useActionRunner();

  const discard = useCallback(async () => {
    if (await run(() => cancelSession(sessionId))) router.replace("/");
  }, [run, sessionId]);

  const cancel = useCallback(() => {
    const done = view ? countDoneSets(view.exercises) : 0;
    const message =
      done === 0
        ? t("session.cancelConfirm.messageEmpty")
        : t("session.cancelConfirm.messageDone", { count: done });
    Alert.alert(t("session.cancelConfirm.title"), message, [
      { text: t("session.cancelConfirm.keep"), style: "cancel" },
      {
        text: t("session.cancel"),
        style: "destructive",
        onPress: () => void discard(),
      },
    ]);
  }, [view, discard, t]);

  return { cancel, hasError };
}
