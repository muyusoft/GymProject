import { useCallback, useMemo, useState } from "react";
import { useSettingsStore } from "@/shared/store";
import type { Movement } from "../types/warmup.types";
import type { SessionView } from "../types/workout.types";
import type { PrimaryMuscle } from "../utils/warmup-plan.utils";
import { muscleLoad } from "../utils/warmup-plan.utils";
import { pickWarmup } from "../utils/warmup-selection.utils";
import { useChecklist } from "./use-checklist";

// Sesiones donde la persona ya saltó o terminó el calentamiento: no se vuelve a ofrecer al reabrirlas.
const closedSessions = new Set<string>();

interface WarmupOptions {
  sessionId: string;
  view: SessionView | null;
  muscles: readonly PrimaryMuscle[];
}

interface Warmup {
  isVisible: boolean;
  movements: readonly Movement[];
  doneIds: ReadonlySet<string>;
  toggle: (id: string) => void;
  close: () => void;
}

/** El calentamiento opcional antes de la primera serie, elegido para los músculos y el tiempo del día. */
export function useWarmup({ sessionId, view, muscles }: WarmupOptions): Warmup {
  const isEnabled = useSettingsStore((state) => state.warmupEnabled);
  const minutes = useSettingsStore((state) => state.sessionMinutes);
  const hasBand = useSettingsStore((state) => state.equipment.includes("bands"));
  const [isClosed, setIsClosed] = useState(() => closedSessions.has(sessionId));
  const { doneIds, toggle } = useChecklist();
  const exercises = view?.exercises;

  const movements = useMemo(() => {
    const sets = (exercises ?? []).map((exercise) => ({ exerciseId: exercise.exerciseId, sets: exercise.template.sets }));
    return pickWarmup({ load: muscleLoad(sets, muscles), minutes, hasBand });
  }, [exercises, muscles, minutes, hasBand]);

  const close = useCallback(() => {
    closedSessions.add(sessionId);
    setIsClosed(true);
  }, [sessionId]);

  const hasStarted = (exercises ?? []).some((exercise) => exercise.sets.some((set) => set.completed));
  const isOpen = view !== null && view.endedAt === null && (exercises?.length ?? 0) > 0;
  return { isVisible: isEnabled && isOpen && !isClosed && !hasStarted, movements, doneIds, toggle, close };
}
