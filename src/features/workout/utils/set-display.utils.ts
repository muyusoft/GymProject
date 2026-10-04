import type { LoadType } from "@/shared/types/training.types";

export function usesWeight(loadType: LoadType): boolean {
  return loadType !== "bodyweight" && loadType !== "time";
}

export function isTimed(loadType: LoadType): boolean {
  return loadType === "time";
}

export const SET_LIMITS = {
  weight: { min: 0, max: 1000 },
  reps: { min: 1, max: 50, step: 1 },
  seconds: { min: 5, max: 600, step: 5 },
} as const;
