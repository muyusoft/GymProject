import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { duplicateDay, moveDay, removeDay } from "../services/plan.service";
import type { DaySummary } from "../types/plan.types";

interface DayActionsState {
  selected: DaySummary | null;
  open: (day: DaySummary) => void;
  close: () => void;
  move: (weekday: number) => Promise<void>;
  duplicate: (weekday: number) => Promise<void>;
  remove: () => Promise<void>;
  hasError: boolean;
}

/** Mover, duplicar o eliminar el día elegido con pulsación larga; `onChanged` recarga el plan. */
export function useDayActions(onChanged: () => Promise<void>): DayActionsState {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<DaySummary | null>(null);
  const { run, hasError } = useActionRunner();

  const apply = useCallback(
    async (action: (day: DaySummary) => Promise<unknown>) => {
      if (!selected) return;
      if (!(await run(() => action(selected)))) return;
      setSelected(null);
      await onChanged();
    },
    [selected, run, onChanged],
  );

  return {
    selected,
    open: setSelected,
    close: () => setSelected(null),
    move: (weekday) => apply((day) => moveDay(day.id, weekday)),
    duplicate: (weekday) =>
      apply((day) =>
        duplicateDay({
          dayId: day.id,
          weekday,
          name: t("plan.copyName", { name: day.name }),
        }),
      ),
    remove: () => apply((day) => removeDay(day.id)),
    hasError,
  };
}
