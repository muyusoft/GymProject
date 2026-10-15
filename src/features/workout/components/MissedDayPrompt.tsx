import { useMissedDay } from "../hooks/use-missed-day";
import type { MissedDayOffer } from "../types/workout.types";
import { MissedDayCard } from "./MissedDayCard";

interface MissedDayPromptProps {
  offer: MissedDayOffer;
  /** Recarga Hoy después de decidir: lo de hoy puede haber cambiado. */
  onChanged: () => Promise<void>;
}

export function MissedDayPrompt({ offer, onChanged }: Readonly<MissedDayPromptProps>) {
  const { doToday, keepPlan, isSaving, hasError } = useMissedDay(offer, onChanged);

  return (
    <MissedDayCard
      offer={offer}
      isSaving={isSaving}
      hasError={hasError}
      onDoToday={doToday}
      onKeepPlan={keepPlan}
    />
  );
}
