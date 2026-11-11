import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { resetDaySessions } from "../services/session-reset.service";

interface ResetTodayOptions {
  dayId: string;
  date: string;
  onReset: () => Promise<void>;
}

interface ResetToday {
  /** Pide confirmación y, si se acepta, borra la sesión de hoy y recarga Hoy. */
  reset: () => void;
  isResetting: boolean;
  hasError: boolean;
}

/** Solo para pruebas: volver a hacer el entreno de hoy desde cero. */
export function useResetToday({ dayId, date, onReset }: ResetTodayOptions): ResetToday {
  const { t } = useTranslation();
  const { run, isRunning, hasError } = useActionRunner();

  const confirmReset = useCallback(async () => {
    if (await run(() => resetDaySessions({ dayId, date }))) await onReset();
  }, [run, dayId, date, onReset]);

  const reset = useCallback(() => {
    Alert.alert(t("today.devReset.title"), t("today.devReset.message"), [
      { text: t("today.devReset.keep"), style: "cancel" },
      { text: t("today.devReset.confirm"), style: "destructive", onPress: () => void confirmReset() },
    ]);
  }, [confirmReset, t]);

  return { reset, isResetting: isRunning, hasError };
}
