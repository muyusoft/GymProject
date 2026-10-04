import type { SemanticColors } from "@/design/tokens";
import type { GroupPaintMap } from "@/shared/utils/body-map.utils";
import type { MuscleLink } from "../types/muscles.types";

/** Principal en volt, secundario en verde oscuro; lo que no está en los datos no se pinta. */
export function exercisePaint(links: readonly MuscleLink[], c: SemanticColors): GroupPaintMap {
  return Object.fromEntries(
    links.map((link) => [link.group, { color: link.role === "primary" ? c.musclePrimary : c.muscleSecondary, view: link.view }]),
  );
}

export interface MuscleSummary {
  primary: MuscleLink[];
  secondary: MuscleLink[];
}

export function summarizeLinks(links: readonly MuscleLink[]): MuscleSummary {
  return {
    primary: links.filter((link) => link.role === "primary"),
    secondary: links.filter((link) => link.role === "secondary"),
  };
}

const CITATION_UNTIL_YEAR = /^(.*?\b\d{4})/;

/** "Buonsenso et al. 2025, título largo…" → "Buonsenso et al. 2025". */
export function shortCitation(citation: string): string {
  return CITATION_UNTIL_YEAR.exec(citation)?.[1]?.trim() ?? citation;
}

/** Los ids de fuente sin repetir y en el orden en que aparecen. */
export function uniqueSourceIds(links: readonly MuscleLink[]): string[] {
  return [...new Set(links.flatMap((link) => link.sourceIds))];
}

interface RawLink {
  exerciseId: string;
  muscleGroup: MuscleLink["group"];
  view: MuscleLink["view"];
  role: MuscleLink["role"];
  basis: MuscleLink["basis"];
  sourceIds: string;
}

/** Fila de exercise_muscles → vínculo; un JSON de fuentes dañado cuenta como sin fuentes, nunca como músculo inventado. */
export function toMuscleLink(row: RawLink): MuscleLink {
  let sourceIds: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.sourceIds);
    if (Array.isArray(parsed)) sourceIds = parsed.filter((id): id is string => typeof id === "string");
  } catch {
    sourceIds = [];
  }
  return { exerciseId: row.exerciseId, group: row.muscleGroup, view: row.view, role: row.role, basis: row.basis, sourceIds };
}
