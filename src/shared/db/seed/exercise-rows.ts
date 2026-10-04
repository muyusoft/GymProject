import {
  SOURCE_STRENGTHS,
  type Equipment,
  type LoadType,
  type SourceStrength,
} from "@/shared/types/training.types";
import { isOneOf } from "@/shared/utils/guard.utils";

const EQUIPMENT_BY_FREE_DB: Record<string, Equipment> = {
  barbell: "barbell",
  "e-z curl bar": "barbell",
  dumbbell: "dumbbell",
  machine: "machine",
  cable: "cable",
  "body only": "bodyweight",
  kettlebells: "kettlebell",
  bands: "band",
};

export function mapEquipment(raw: string | null): Equipment {
  return (raw && EQUIPMENT_BY_FREE_DB[raw]) || "other";
}

export function defaultLoadTypeFor(equipment: Equipment): LoadType {
  if (equipment === "dumbbell" || equipment === "kettlebell") return "per_arm";
  if (equipment === "bodyweight") return "bodyweight";
  return "total";
}

/** La evidencia de un ejercicio es la de su mejor fuente. */
export function bestStrength(
  sourceIds: readonly string[],
  strengthById: ReadonlyMap<string, string>,
): SourceStrength | null {
  const found = sourceIds
    .map((id) => strengthById.get(id))
    .filter((strength): strength is SourceStrength =>
      strength !== undefined && isOneOf(SOURCE_STRENGTHS, strength),
    );
  return SOURCE_STRENGTHS.find((strength) => found.includes(strength)) ?? null;
}
