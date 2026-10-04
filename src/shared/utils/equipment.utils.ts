import type {
  Equipment,
  IncrementEquipment,
  WeightUnit,
} from "@/shared/types/training.types";

export const FALLBACK_WEIGHT_STEP = 2.5;

/** Qué salto de Ajustes aplica a cada equipo del catálogo. */
export function equipmentIncrementKey(equipment: Equipment): IncrementEquipment {
  if (equipment === "dumbbell" || equipment === "kettlebell") return "dumbbell";
  if (equipment === "machine" || equipment === "cable") return "machine";
  return "plates";
}

interface IncrementRule {
  equipment: IncrementEquipment;
  unit: WeightUnit;
  step: number;
}

interface StepLookup {
  increments: readonly IncrementRule[];
  equipment: Equipment;
  unit: WeightUnit;
}

/** Salto de peso del equipo en esa unidad; sin configuración usa 2.5. */
export function weightStepFor({ increments, equipment, unit }: StepLookup): number {
  const key = equipmentIncrementKey(equipment);
  const rule = increments.find((item) => item.equipment === key && item.unit === unit);
  return rule?.step ?? FALLBACK_WEIGHT_STEP;
}
