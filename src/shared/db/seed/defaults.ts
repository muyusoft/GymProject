import type { IncrementEquipment, WeightUnit } from "@/shared/types/training.types";

export interface IncrementDefault {
  equipment: IncrementEquipment;
  unit: WeightUnit;
  step: number;
}

/** Saltos de peso iniciales; el usuario los ajusta en Ajustes. */
export const DEFAULT_INCREMENTS: readonly IncrementDefault[] = [
  { equipment: "dumbbell", unit: "lb", step: 2.5 },
  { equipment: "machine", unit: "lb", step: 5 },
  { equipment: "machine", unit: "kg", step: 2.5 },
  { equipment: "plates", unit: "kg", step: 2.5 },
];
