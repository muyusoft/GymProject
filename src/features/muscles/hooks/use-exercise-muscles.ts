import { useCallback, useEffect, useState } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadDayMuscles, type DayMusclesData } from "../services/exercise-muscles.service";
import type { DayExerciseMuscles } from "../types/muscles.types";

interface ExerciseMusclesState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  data: DayMusclesData | null;
  selected: DayExerciseMuscles | null;
  select: (exerciseId: string) => void;
}

/** Los ejercicios del día y el que se está mirando; el primero queda elegido al abrir. */
export function useExerciseMuscles(dayId: string | undefined): ExerciseMusclesState {
  const loader = useCallback(() => loadDayMuscles(dayId, new Date()), [dayId]);
  const { status, data, reload } = useFocusResource(loader);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (data && !data.exercises.some((exercise) => exercise.exerciseId === selectedId)) {
      setSelectedId(data.exercises[0]?.exerciseId ?? null);
    }
  }, [data, selectedId]);

  const selected = data?.exercises.find((exercise) => exercise.exerciseId === selectedId) ?? null;
  return { status, reload, data, selected, select: setSelectedId };
}
