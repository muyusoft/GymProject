import { useEffect, useState } from "react";
import { logger } from "@/config/logger";
import { loadPrimaryMuscles } from "../services/warmup.service";
import type { PrimaryMuscle } from "../utils/warmup-plan.utils";

const NO_MUSCLES: readonly PrimaryMuscle[] = [];
const ID_SEPARATOR = "|";

/**
 * Músculos principales de los ejercicios de la sesión. Si la lectura falla, el calentamiento
 * sigue funcionando con movimientos generales: es opcional y no debe bloquear el entreno.
 */
export function useDayMuscles(exerciseIds: readonly string[]): readonly PrimaryMuscle[] {
  const key = exerciseIds.join(ID_SEPARATOR);
  const [muscles, setMuscles] = useState<readonly PrimaryMuscle[]>(NO_MUSCLES);

  useEffect(() => {
    let isActive = true;
    const ids = key ? key.split(ID_SEPARATOR) : [];
    loadPrimaryMuscles(ids)
      .then((rows) => {
        if (isActive) setMuscles(rows);
      })
      .catch((error: unknown) => logger.error("Failed to load day muscles", { error }));
    return () => {
      isActive = false;
    };
  }, [key]);

  return muscles;
}
