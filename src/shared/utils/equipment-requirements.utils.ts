import {
  GYM_EQUIPMENT,
  type EquipmentRequirements,
  type GymEquipment,
} from "@/shared/types/equipment.types";
import { isOneOf } from "./guard.utils";

function isOption(value: unknown): value is GymEquipment[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && isOneOf(GYM_EQUIPMENT, item));
}

function isRequirementList(value: unknown): value is GymEquipment[][] {
  return Array.isArray(value) && value.every(isOption);
}

/** Lee la columna `requires`: JSON ausente, dañado o con equipo desconocido cuenta como "sin dato". */
export function parseRequirements(json: string | null): EquipmentRequirements {
  if (!json) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    return isRequirementList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** ¿Alcanza el equipo marcado para alguna de las combinaciones? Sin dato, no: mejor no proponerlo. */
export function canPerform(
  requirements: EquipmentRequirements,
  available: ReadonlySet<GymEquipment>,
): boolean {
  if (requirements === null) return false;
  return requirements.some((option) => option.every((item) => available.has(item)));
}
