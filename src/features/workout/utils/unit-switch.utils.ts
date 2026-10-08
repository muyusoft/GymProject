import type { WeightUnit } from "@/shared/types/training.types";
import { convertWeight, roundToIncrement } from "@/shared/utils/weight.utils";
import type { SessionSet } from "../types/workout.types";

interface UnitSwitchOptions {
  sets: readonly SessionSet[];
  /** Unidad a la que se pasa el ejercicio. */
  unit: WeightUnit;
  /** Salto del equipo en esa unidad: el peso convertido se acerca a un valor que el equipo sí tiene. */
  step: number;
}

export interface UnitSwitch {
  id: string;
  weight: number | null;
  unit: WeightUnit;
}

/**
 * Cambiar de unidad es cosa del ejercicio entero (la máquina está en kg o en lb), así que afecta a todas
 * sus series pendientes. Las ya hechas se quedan como se registraron: son lo que de verdad se levantó.
 */
export function switchPendingSets({
  sets,
  unit,
  step,
}: UnitSwitchOptions): UnitSwitch[] {
  return sets
    .filter((set) => !set.completed && set.unit !== unit)
    .map((set) => ({
      id: set.id,
      unit,
      weight:
        set.weight === null
          ? null
          : roundToIncrement(convertWeight(set.weight, set.unit, unit), step),
    }));
}
