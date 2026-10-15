import { useCallback, useState } from "react";
import { successFeedback } from "@/shared/services/haptics.service";
import type { Movement } from "../types/warmup.types";
import { useCountdown } from "./use-countdown";

const MS_PER_SECOND = 1000;
const FIRST_SIDE = 1;
const SECOND_SIDE = 2;

export interface ActiveStretch {
  movement: Movement;
  /** 1 o 2 en los estiramientos por lado; 1 en los demás. */
  side: number;
  endsAt: number;
}

interface StretchTimer {
  active: ActiveStretch | null;
  remaining: number;
  start: (movement: Movement) => void;
  stop: () => void;
}

const endsIn = (movement: Movement) => Date.now() + movement.dose.amount * MS_PER_SECOND;

/** Cronómetro de un estiramiento: con dos lados, al acabar el primero sigue el segundo; al final avisa con `onDone`. */
export function useStretchTimer(onDone: (id: string) => void): StretchTimer {
  const [active, setActive] = useState<ActiveStretch | null>(null);

  const handleEnd = useCallback(() => {
    if (!active) return;
    void successFeedback();
    if (active.movement.dose.isPerSide && active.side === FIRST_SIDE) {
      setActive({ movement: active.movement, side: SECOND_SIDE, endsAt: endsIn(active.movement) });
      return;
    }
    onDone(active.movement.id);
    setActive(null);
  }, [active, onDone]);

  const remaining = useCountdown(active?.endsAt ?? null, handleEnd);
  const start = useCallback((movement: Movement) => {
    setActive({ movement, side: FIRST_SIDE, endsAt: endsIn(movement) });
  }, []);
  const stop = useCallback(() => setActive(null), []);

  return { active, remaining, start, stop };
}
