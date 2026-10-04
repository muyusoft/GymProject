import { useCallback, useEffect, useState } from "react";
import { logger } from "@/config/logger";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadSession } from "../services/session-read.service";
import { addSet, updateSet, type SetPatch } from "../services/session-write.service";
import type { SessionExercise, SessionSet, SessionView } from "../types/workout.types";
import { useInsightSettings } from "./use-insight-settings";

interface SessionDataState {
  status: ResourceStatus;
  view: SessionView | null;
  reload: () => Promise<void>;
  patchSet: (setId: string, patch: SetPatch) => void;
  appendSet: (exercise: SessionExercise) => Promise<void>;
  hasError: boolean;
}

function mapSets(
  view: SessionView,
  transform: (exercise: SessionExercise) => SessionSet[],
): SessionView {
  return {
    ...view,
    exercises: view.exercises.map((exercise) => ({ ...exercise, sets: transform(exercise) })),
  };
}

/** La sesión en pantalla: cada cambio se refleja al instante y se guarda en SQLite; si falla, se recarga. */
export function useSessionData(sessionId: string): SessionDataState {
  const settings = useInsightSettings();
  const loader = useCallback(
    () => loadSession({ sessionId, settings, now: new Date() }),
    [sessionId, settings],
  );
  const { status, data, reload } = useFocusResource(loader);
  const [view, setView] = useState<SessionView | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (data) setView(data);
  }, [data]);

  const fail = useCallback(
    (error: unknown) => {
      logger.error("Failed to save session change", { error });
      setHasError(true);
      void reload();
    },
    [reload],
  );

  const patchSet = useCallback(
    (setId: string, patch: SetPatch) => {
      setHasError(false);
      setView((current) =>
        current &&
        mapSets(current, (exercise) =>
          exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
        ),
      );
      updateSet(setId, patch).catch(fail);
    },
    [fail],
  );

  const appendSet = useCallback(
    async (exercise: SessionExercise) => {
      try {
        const created = await addSet({
          sessionId,
          exerciseId: exercise.exerciseId,
          last: exercise.sets[exercise.sets.length - 1],
          template: exercise.template,
        });
        setView((current) =>
          current &&
          mapSets(current, (item) =>
            item.exerciseId === exercise.exerciseId ? [...item.sets, created] : item.sets,
          ),
        );
      } catch (error) {
        fail(error);
      }
    },
    [sessionId, fail],
  );

  return { status, view, reload, patchSet, appendSet, hasError };
}
