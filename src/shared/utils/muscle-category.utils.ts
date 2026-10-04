import type { MuscleCategory, MuscleGroup } from "@/shared/types/training.types";

const CATEGORY_BY_GROUP: Record<MuscleGroup, MuscleCategory> = {
  deltoids: "shoulder",
  "upper-back": "back",
  trapezius: "back",
  "lower-back": "back",
  chest: "chest",
  quadriceps: "legs",
  hamstring: "legs",
  gluteal: "legs",
  adductors: "legs",
  calves: "legs",
  biceps: "arms",
  triceps: "arms",
  forearm: "arms",
  abs: "core",
  obliques: "core",
};

/** La categoría sale del primer músculo principal; sin músculos mapeados no hay categoría. */
export function categoryOf(primary: readonly { group: MuscleGroup }[]): MuscleCategory | null {
  const first = primary[0];
  return first ? CATEGORY_BY_GROUP[first.group] : null;
}
