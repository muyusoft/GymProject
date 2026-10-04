import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { logger } from "@/config/logger";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { successFeedback, tapFeedback } from "@/shared/services/haptics.service";
import { toValidSet } from "@/shared/utils/one-rep-max.utils";
import { isNewRecord } from "../services/record.service";
import { finishSession, type SetPatch } from "../services/session-write.service";
import type { SessionExercise, SessionSet } from "../types/workout.types";
import { countDoneSets, countTotalSets } from "../utils/session-stats.utils";
import { useRestTimer } from "./use-rest-timer";
import { useSessionData } from "./use-session-data";

export function useSession(sessionId: string) {
  const { t } = useTranslation();
  const data = useSessionData(sessionId);
  const timer = useRestTimer();
  const { run, hasError: hasFinishError } = useActionRunner();
  const [current, setCurrent] = useState(0);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const { view, patchSet } = data;

  /** Marca la serie como récord si supera todo lo registrado antes; se re-evalúa al editarla ya hecha. */
  const evaluateRecord = useCallback(
    async (exercise: SessionExercise, set: SessionSet) => {
      const candidate = toValidSet({ ...set, completed: true });
      if (!candidate) return patchSet(set.id, { isPR: false });
      try {
        const isPR = await isNewRecord({ exerciseId: exercise.exerciseId, sessionId, candidate });
        patchSet(set.id, { isPR });
      } catch (error) {
        logger.error("Failed to check personal record", { error });
      }
    },
    [patchSet, sessionId],
  );

  const toggleSet = useCallback(
    (exercise: SessionExercise, set: SessionSet) => {
      if (set.completed) return patchSet(set.id, { completed: false, isPR: false });
      patchSet(set.id, { completed: true });
      void tapFeedback();
      void evaluateRecord(exercise, set);
      if (!view) return;
      const pending = countTotalSets(view.exercises) - countDoneSets(view.exercises);
      if (pending > 1) timer.start(exercise.template.restSec);
    },
    [patchSet, evaluateRecord, view, timer],
  );

  const changeSet = useCallback(
    (exercise: SessionExercise, setId: string, patch: SetPatch) => {
      patchSet(setId, patch);
      const set = exercise.sets.find((item) => item.id === setId);
      if (set?.completed) void evaluateRecord(exercise, { ...set, ...patch });
    },
    [patchSet, evaluateRecord],
  );

  const complete = useCallback(async () => {
    if (await run(() => finishSession(sessionId, new Date()))) {
      void successFeedback();
      router.replace("/");
    }
  }, [run, sessionId]);

  const finish = useCallback(() => {
    const pending = view ? countTotalSets(view.exercises) - countDoneSets(view.exercises) : 0;
    if (pending === 0) return void complete();
    Alert.alert(t("session.finishConfirm.title"), t("session.finishConfirm.message", { count: pending }), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("session.finishConfirm.confirm"), onPress: () => void complete() },
    ]);
  }, [view, complete, t]);

  return {
    ...data,
    timer,
    current,
    goTo: (index: number) => {
      setCurrent(index);
      setEditingSetId(null);
    },
    editingSetId,
    setEditingSetId,
    toggleSet,
    changeSet,
    finish,
    hasError: data.hasError || hasFinishError,
  };
}
