import { useCallback, useMemo, useState } from "react";
import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import type { SubstituteSubject } from "@/shared/types/substitute.types";
import { replacePlanExercise } from "../services/plan-substitute.service";

interface PlanSubstitutionOptions {
  /** Los ejercicios del día: no se ofrecen como sustitutos. */
  exercises: readonly PlanExerciseDetail[];
  onChanged: () => Promise<void>;
}

interface PlanSubstitutionState {
  subject: SubstituteSubject | null;
  excludedIds: readonly string[];
  open: (entry: PlanExerciseDetail) => void;
  close: () => void;
  apply: (substituteId: string) => Promise<void>;
  isApplying: boolean;
  hasError: boolean;
}

/** Cambiar un ejercicio desde el editor del día: el cambio va directo al plan. */
export function usePlanSubstitution({ exercises, onChanged }: PlanSubstitutionOptions): PlanSubstitutionState {
  const [subject, setSubject] = useState<SubstituteSubject | null>(null);
  const { run, isRunning, hasError } = useActionRunner();
  const excludedIds = useMemo(() => exercises.map((entry) => entry.exercise.id), [exercises]);

  const open = useCallback((entry: PlanExerciseDetail) => {
    const { planExercise, exercise } = entry;
    setSubject({ key: planExercise.id, originalExerciseId: exercise.id, nameEs: exercise.nameEs, nameEn: exercise.nameEn });
  }, []);

  const apply = useCallback(
    async (substituteId: string) => {
      if (!subject) return;
      const isApplied = await run(() => replacePlanExercise({ planExerciseId: subject.key, substituteId }));
      if (!isApplied) return;
      setSubject(null);
      await onChanged();
    },
    [subject, run, onChanged],
  );

  return { subject, excludedIds, open, close: () => setSubject(null), apply, isApplying: isRunning, hasError };
}
