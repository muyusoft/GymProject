import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { logger } from "@/config/logger";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import {
  successFeedback,
  tapFeedback,
} from "@/shared/services/haptics.service";
import { effortToRpe, type EffortLevel } from "@/shared/utils/effort.utils";
import { toValidSet } from "@/shared/utils/one-rep-max.utils";
import { isNewRecord } from "../services/record.service";
import {
  finishSession,
  type SetPatch,
} from "../services/session-write.service";
import type { SessionExercise, SessionSet } from "../types/workout.types";
import {
  repsAfterApply,
  type SessionHintChoice,
} from "../utils/session-hint.utils";
import {
  countDoneSets,
  countTotalSets,
  firstPendingIndex,
} from "../utils/session-stats.utils";
import { useRestTimer } from "./use-rest-timer";
import { useSessionData } from "./use-session-data";

export function useSession(sessionId: string) {
  const { t } = useTranslation();
  const data = useSessionData(sessionId);
  const timer = useRestTimer();
  const { run, hasError: hasFinishError } = useActionRunner();
  // null hasta que carga la sesión: entonces se fija en el ejercicio donde se quedó.
  const [selected, setSelected] = useState<number | null>(null);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const { view, patchSet } = data;
  const current = selected ?? (view ? firstPendingIndex(view.exercises) : 0);

  useEffect(() => {
    if (view && selected === null)
      setSelected(firstPendingIndex(view.exercises));
  }, [view, selected]);

  /** Marca la serie como récord si supera todo lo registrado antes; se re-evalúa al editarla ya hecha. */
  const evaluateRecord = useCallback(
    async (exercise: SessionExercise, set: SessionSet) => {
      const candidate = toValidSet({ ...set, completed: true });
      if (!candidate) return patchSet(set.id, { isPR: false });
      try {
        const isPR = await isNewRecord({
          exerciseId: exercise.exerciseId,
          sessionId,
          candidate,
        });
        patchSet(set.id, { isPR });
      } catch (error) {
        logger.error("Failed to check personal record", { error });
      }
    },
    [patchSet, sessionId],
  );

  const toggleSet = useCallback(
    (exercise: SessionExercise, set: SessionSet) => {
      if (set.completed)
        return patchSet(set.id, { completed: false, isPR: false });
      patchSet(set.id, { completed: true });
      void tapFeedback();
      void evaluateRecord(exercise, set);
      if (!view) return;
      const pending =
        countTotalSets(view.exercises) - countDoneSets(view.exercises);
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

  /** La respuesta de esfuerzo es del ejercicio entero: se guarda en todas sus series. */
  const rateEffort = useCallback(
    (exercise: SessionExercise, level: EffortLevel | null) => {
      const rpe = level === null ? null : effortToRpe(level);
      for (const set of exercise.sets) patchSet(set.id, { rpe });
    },
    [patchSet],
  );

  /** Aceptar una sugerencia cambia las series que faltan; las ya hechas se quedan como se registraron. */
  const applyHint = useCallback(
    (exercise: SessionExercise, { weight, variant }: SessionHintChoice) => {
      const reps = repsAfterApply(exercise, variant);
      for (const set of exercise.sets) {
        if (!set.completed)
          patchSet(set.id, reps === null ? { weight } : { weight, reps });
      }
    },
    [patchSet],
  );

  const complete = useCallback(async () => {
    if (await run(() => finishSession(sessionId, new Date()))) {
      void successFeedback();
      router.replace("/");
    }
  }, [run, sessionId]);

  const finish = useCallback(() => {
    const pending = view
      ? countTotalSets(view.exercises) - countDoneSets(view.exercises)
      : 0;
    if (pending === 0) return void complete();
    Alert.alert(
      t("session.finishConfirm.title"),
      t("session.finishConfirm.message", { count: pending }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("session.finishConfirm.confirm"),
          onPress: () => void complete(),
        },
      ],
    );
  }, [view, complete, t]);

  return {
    ...data,
    timer,
    current,
    goTo: (index: number) => {
      setSelected(index);
      setEditingSetId(null);
    },
    editingSetId,
    setEditingSetId,
    toggleSet,
    changeSet,
    rateEffort,
    applyHint,
    finish,
    hasError: data.hasError || hasFinishError,
  };
}
