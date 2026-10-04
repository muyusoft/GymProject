import type { MuscleGroup, MuscleView } from "@/shared/types/training.types";

/** Clave de traducción del músculo; el deltoides se nombra por vista (anterior, posterior, lateral). */
export function muscleLabelKey({ group, view }: { group: MuscleGroup; view: MuscleView }): string {
  return group === "deltoids" ? `muscles.deltoids.${view}` : `muscles.group.${group}`;
}
