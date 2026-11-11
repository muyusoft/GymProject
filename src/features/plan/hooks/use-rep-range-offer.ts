import { useCallback, useMemo } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import {
  applyRepRanges,
  listFixedRepExercises,
} from "../services/rep-range.service";

interface RepRangeOfferState {
  /** Ejercicios con reps fijas que todavía no se descartaron; 0 = no mostrar la tarjeta. */
  count: number;
  apply: () => Promise<void>;
  dismiss: () => void;
  isApplying: boolean;
  hasError: boolean;
}

/** La propuesta de pasar a rango de reps los ejercicios del plan que tienen un objetivo fijo. */
export function useRepRangeOffer(): RepRangeOfferState {
  const { data, reload } = useFocusResource(listFixedRepExercises);
  const dismissed = useSettingsStore((state) => state.repRangeOfferDismissed);
  const update = useSettingsStore((state) => state.update);
  const { run, isRunning, hasError } = useActionRunner();

  const pending = useMemo(() => {
    const skipped = new Set(dismissed);
    return (data ?? []).filter((row) => !skipped.has(row.id));
  }, [data, dismissed]);

  const apply = useCallback(async () => {
    const isApplied = await run(() => applyRepRanges(pending));
    if (isApplied) await reload();
  }, [run, pending, reload]);

  const dismiss = useCallback(() => {
    const ids = [...dismissed, ...pending.map((row) => row.id)];
    void run(() => update("repRangeOfferDismissed", ids));
  }, [run, update, dismissed, pending]);

  return {
    count: pending.length,
    apply,
    dismiss,
    isApplying: isRunning,
    hasError,
  };
}
