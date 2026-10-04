import { useEffect, useState } from "react";
import type { PlanDayPatch } from "@/shared/db/types";
import type { DayDefaults, DayDetail } from "../types/plan.types";

interface DayDraft {
  name: string;
  setName: (name: string) => void;
  defaults: DayDefaults | null;
  setDefaults: (defaults: DayDefaults) => void;
  toPatch: () => PlanDayPatch;
}

/** Borrador del nombre y los valores base del día; se llena una sola vez al cargar. */
export function useDayDraft(detail: DayDetail | null): DayDraft {
  const [name, setName] = useState("");
  const [defaults, setDefaults] = useState<DayDefaults | null>(null);

  useEffect(() => {
    if (!detail || defaults !== null) return;
    setName(detail.day.name);
    setDefaults({
      sets: detail.day.defaultSets,
      reps: detail.day.defaultReps,
      restSec: detail.day.defaultRestSec,
    });
  }, [detail, defaults]);

  const toPatch = (): PlanDayPatch => ({
    name: name.trim() || (detail?.day.name ?? ""),
    ...(defaults && {
      defaultSets: defaults.sets,
      defaultReps: defaults.reps,
      defaultRestSec: defaults.restSec,
    }),
  });

  return { name, setName, defaults, setDefaults, toPatch };
}
