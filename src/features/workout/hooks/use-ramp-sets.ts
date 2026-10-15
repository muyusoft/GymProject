import { useCallback, useMemo, useState } from "react";
import { useSettingsStore } from "@/shared/store";
import type { WeightUnit } from "@/shared/types/training.types";
import type { RampSet } from "../types/warmup.types";
import type { SessionExercise } from "../types/workout.types";
import { rampSets } from "../utils/ramp-sets.utils";
import { findRampExercise, workingWeight, type PrimaryMuscle } from "../utils/warmup-plan.utils";

export interface RampPlan {
  sets: readonly RampSet[];
  unit: WeightUnit;
}

interface RampState {
  /** Las series de aproximación de este ejercicio, o null si no le toca o ya empezó. */
  rampFor: (exercise: SessionExercise) => RampPlan | null;
  hide: () => void;
}

/** Aproximación solo para el primer compuesto con peso, hasta que se hace su primera serie o se oculta. */
export function useRampSets(exercises: readonly SessionExercise[], muscles: readonly PrimaryMuscle[]): RampState {
  const isEnabled = useSettingsStore((state) => state.warmupEnabled);
  const [isHidden, setIsHidden] = useState(false);
  const target = useMemo(() => findRampExercise(exercises, muscles), [exercises, muscles]);

  const rampFor = useCallback(
    (exercise: SessionExercise): RampPlan | null => {
      if (!isEnabled || isHidden || exercise.exerciseId !== target?.exerciseId) return null;
      if (exercise.sets.some((set) => set.completed)) return null;
      // La unidad de la primera serie: puede haberse cambiado durante la sesión.
      const unit = exercise.sets[0]?.unit ?? exercise.template.unit;
      const sets = rampSets({ weight: workingWeight(exercise), unit, step: exercise.template.weightSteps[unit] });
      return sets.length > 0 ? { sets, unit } : null;
    },
    [isEnabled, isHidden, target],
  );

  const hide = useCallback(() => setIsHidden(true), []);
  return { rampFor, hide };
}
