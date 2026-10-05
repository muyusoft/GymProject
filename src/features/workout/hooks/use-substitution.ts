import { useCallback, useMemo, useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { substituteExercise } from "../services/substitute.service";
import type { PlanSlot, SubstituteScope } from "../types/workout.types";

const ID_SEPARATOR = "|";

/** El ejercicio que se quiere cambiar: el que hoy ocupa ese lugar del plan. */
export interface SubstituteTarget {
  slot: PlanSlot;
  exerciseId: string;
  nameEs: string;
  nameEn: string;
}

interface SubstitutionOptions {
  /** Fecha (yyyy-MM-dd) del entreno al que aplica el cambio. */
  date: string;
  sessionId: string | null;
  /** Los ejercicios del entreno de hoy: no se ofrecen como sustitutos. */
  exercises: readonly { exerciseId: string }[];
  onChanged: () => Promise<void>;
}

interface SubstitutionState {
  target: SubstituteTarget | null;
  excludedIds: readonly string[];
  open: (target: SubstituteTarget) => void;
  close: () => void;
  apply: (substituteId: string, scope: SubstituteScope) => Promise<void>;
  isApplying: boolean;
  hasError: boolean;
}

/** Abrir la hoja de sustitutos para un ejercicio y aplicar el elegido, solo hoy o también en el plan. */
export function useSubstitution({ date, sessionId, exercises, onChanged }: SubstitutionOptions): SubstitutionState {
  const [target, setTarget] = useState<SubstituteTarget | null>(null);
  const { run, isRunning, hasError } = useActionRunner();
  // La lista solo cambia de identidad cuando cambian los ejercicios, no con cada serie marcada.
  const idsKey = exercises.map((exercise) => exercise.exerciseId).join(ID_SEPARATOR);
  const excludedIds = useMemo(() => (idsKey === "" ? [] : idsKey.split(ID_SEPARATOR)), [idsKey]);

  const apply = useCallback(
    async (substituteId: string, scope: SubstituteScope) => {
      if (!target) return;
      const { slot, exerciseId: currentExerciseId } = target;
      const isApplied = await run(() =>
        substituteExercise({ planExerciseId: slot.planExerciseId, currentExerciseId, substituteId, date, sessionId, scope }),
      );
      if (!isApplied) return;
      setTarget(null);
      await onChanged();
    },
    [target, run, date, sessionId, onChanged],
  );

  return { target, excludedIds, open: setTarget, close: () => setTarget(null), apply, isApplying: isRunning, hasError };
}
