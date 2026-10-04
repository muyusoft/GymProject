import type { MuscleGroup, MuscleView } from "@/shared/types/training.types";

export type BodySide = "front" | "back";

export interface GroupPaint {
  color: string;
  /** Dónde se pinta el grupo; sin dato, en las dos vistas. */
  view?: MuscleView;
}

export type GroupPaintMap = Partial<Record<MuscleGroup, GroupPaint>>;

export interface BodyPartPaint {
  slug: MuscleGroup;
  color: string;
}

/**
 * Los grupos que se pintan en una vista. El deltoides anterior solo va de frente y el posterior solo en la
 * espalda; un grupo sin dato no aparece y la figura lo deja en el color de "no trabaja".
 */
export function buildBodyParts(groups: GroupPaintMap, side: BodySide): BodyPartPaint[] {
  return (Object.entries(groups) as [MuscleGroup, GroupPaint | undefined][]).flatMap(([slug, paint]) => {
    if (!paint) return [];
    const view = paint.view ?? "both";
    return view === "both" || view === side ? [{ slug, color: paint.color }] : [];
  });
}
