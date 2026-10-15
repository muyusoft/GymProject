import { useCallback } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { toIsoDate } from "@/shared/utils/week.utils";
import { resolveMissedDay } from "../services/week-state.service";
import type { MissedDayOffer } from "../types/workout.types";

interface MissedDayActions {
  /** Hace hoy el día perdido; el resto de la semana se corre. */
  doToday: () => void;
  /** Sigue con el plan; ese día no se vuelve a ofrecer. */
  keepPlan: () => void;
  isSaving: boolean;
  hasError: boolean;
}

export function useMissedDay(
  offer: MissedDayOffer | null,
  onChanged: () => Promise<void>,
): MissedDayActions {
  const { run, isRunning, hasError } = useActionRunner();

  const decide = useCallback(
    async (isDoingToday: boolean) => {
      if (!offer) return;
      const targetDate = isDoingToday ? toIsoDate(new Date()) : null;
      const isSaved = await run(() =>
        resolveMissedDay({ missedDate: offer.date, targetDate }),
      );
      if (isSaved) await onChanged();
    },
    [offer, run, onChanged],
  );

  return {
    doToday: () => void decide(true),
    keepPlan: () => void decide(false),
    isSaving: isRunning,
    hasError,
  };
}
