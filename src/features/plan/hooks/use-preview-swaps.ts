import { useCallback, useMemo, useState } from "react";
import type { CatalogExercise, GeneratedPlan, PlanAnswers } from "../types/plan-generator.types";
import { alternativesFor, swapExercise, type PlanSlot } from "../utils/plan-generator/swap";

interface Swap extends PlanSlot {
  exerciseId: string;
}

interface PreviewSwaps {
  /** El plan con los cambios que hizo la persona. */
  plan: GeneratedPlan | null;
  /** El ejercicio que se está cambiando; null con la hoja cerrada. */
  target: PlanSlot | null;
  alternatives: CatalogExercise[];
  open: (slot: PlanSlot) => void;
  close: () => void;
  choose: (exerciseId: string) => void;
}

/** Cambiar ejercicios del plan propuesto antes de guardarlo. Los cambios se aplican sobre el plan generado. */
export function usePreviewSwaps(
  generated: GeneratedPlan | null,
  catalog: readonly CatalogExercise[],
  answers: PlanAnswers,
): PreviewSwaps {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [target, setTarget] = useState<PlanSlot | null>(null);

  const plan = useMemo(() => {
    if (!generated) return null;
    return swaps.reduce((current, swap) => {
      const replacement = catalog.find((exercise) => exercise.id === swap.exerciseId);
      return replacement ? swapExercise(current, swap, replacement, answers) : current;
    }, generated);
  }, [generated, swaps, catalog, answers]);

  const choose = useCallback(
    (exerciseId: string) => {
      if (target) setSwaps((current) => [...current, { ...target, exerciseId }]);
      setTarget(null);
    },
    [target],
  );

  return {
    plan,
    target,
    alternatives: plan && target ? alternativesFor(plan, target, catalog, answers.equipment) : [],
    open: setTarget,
    close: () => setTarget(null),
    choose,
  };
}
