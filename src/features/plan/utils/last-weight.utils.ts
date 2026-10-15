import type { PlanExerciseRow } from "@/shared/db/types";
import type { LastPerformance } from "@/shared/utils/last-performance.utils";
import { loadTypeUsesWeight } from "./exercise-config.utils";

/**
 * El ejercicio del plan con el último peso que se levantó, en cualquier día: el peso del plan solo es el
 * punto de partida mientras no hay historial. Igual que hace Hoy al armar la sesión.
 */
export function withLastWeightRow(
  row: PlanExerciseRow,
  last: LastPerformance | null,
): PlanExerciseRow {
  if (!last || !loadTypeUsesWeight(row.loadType) || row.targetWeight === null)
    return row;
  return { ...row, targetWeight: last.weight, unit: last.unit };
}
