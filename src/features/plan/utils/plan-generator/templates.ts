import type { MuscleGroup } from "@/shared/types/training.types";
import type {
  DayTemplate,
  PlanFocus,
  TrainingDayCount,
} from "../../types/plan-generator.types";

/**
 * Cada día es una lista de patrones de `muscle-map.json`, compuestos primero. Un patrón que se repite en la
 * semana toma otra variante (lo decide el selector de ejercicios), así no hace falta escribirla aquí.
 */
export const DAY_PATTERNS: Record<DayTemplate, readonly string[]> = {
  fullA: ["squat", "horizontal_push", "horizontal_pull", "hinge_rdl", "lateral_raise", "core"],
  fullB: ["hip_thrust", "vertical_push", "vertical_pull", "lunge", "elbow_flexion", "elbow_extension"],
  fullC: ["squat", "horizontal_push", "horizontal_pull", "knee_flexion", "rear_delt", "core"],
  upperA: ["horizontal_push", "horizontal_pull", "vertical_push", "vertical_pull", "elbow_flexion", "elbow_extension"],
  upperB: ["vertical_pull", "horizontal_push", "horizontal_pull", "lateral_raise", "rear_delt", "elbow_extension"],
  lowerA: ["squat", "hinge_rdl", "knee_flexion", "knee_extension", "calf_standing", "core"],
  lowerB: ["hip_thrust", "lunge", "knee_extension", "knee_flexion", "calf_seated", "core"],
  push: ["horizontal_push", "vertical_push", "fly", "lateral_raise", "elbow_extension"],
  pull: ["vertical_pull", "horizontal_pull", "rear_delt", "shrug", "elbow_flexion"],
};

interface SplitDay {
  weekday: number;
  template: DayTemplate;
}

/** Tipo de rutina por días de entreno: cada músculo unas dos veces por semana (schoenfeld2016freq). */
export const SPLITS: Record<TrainingDayCount, readonly SplitDay[]> = {
  2: [
    { weekday: 0, template: "fullA" },
    { weekday: 3, template: "fullB" },
  ],
  3: [
    { weekday: 0, template: "fullA" },
    { weekday: 2, template: "fullB" },
    { weekday: 4, template: "fullC" },
  ],
  4: [
    { weekday: 0, template: "upperA" },
    { weekday: 1, template: "lowerA" },
    { weekday: 3, template: "upperB" },
    { weekday: 4, template: "lowerB" },
  ],
  5: [
    { weekday: 0, template: "upperA" },
    { weekday: 1, template: "lowerA" },
    { weekday: 2, template: "push" },
    { weekday: 4, template: "pull" },
    { weekday: 5, template: "lowerB" },
  ],
  6: [
    { weekday: 0, template: "push" },
    { weekday: 1, template: "pull" },
    { weekday: 2, template: "lowerA" },
    { weekday: 3, template: "push" },
    { weekday: 4, template: "pull" },
    { weekday: 5, template: "lowerB" },
  ],
};

/** Patrones multiarticulares: más peso, menos reps y más descanso que el aislamiento. */
export const COMPOUND_PATTERNS: ReadonlySet<string> = new Set([
  "horizontal_push",
  "vertical_push",
  "dip",
  "horizontal_pull",
  "vertical_pull",
  "squat",
  "lunge",
  "hinge_conventional",
  "hinge_rdl",
  "hip_thrust",
]);

type FocusRegion = Exclude<PlanFocus, "balanced">;

export const REGION_MUSCLES: Record<FocusRegion, ReadonlySet<MuscleGroup>> = {
  lower: new Set(["gluteal", "quadriceps", "hamstring", "adductors", "calves"]),
  upper: new Set(["chest", "deltoids", "triceps", "biceps", "upper-back", "trapezius"]),
};

const TEMPLATE_REGIONS: Record<DayTemplate, readonly FocusRegion[]> = {
  fullA: ["lower", "upper"],
  fullB: ["lower", "upper"],
  fullC: ["lower", "upper"],
  upperA: ["upper"],
  upperB: ["upper"],
  lowerA: ["lower"],
  lowerB: ["lower"],
  push: ["upper"],
  pull: ["upper"],
};

/** Ejercicio extra que gana un día de la zona priorizada: el primero que el día todavía no tenga. */
const EXTRA_PATTERNS: Record<FocusRegion, readonly string[]> = {
  lower: ["hip_abduction", "hip_thrust"],
  upper: ["lateral_raise", "fly"],
};

/** Los patrones del día, con el ejercicio extra de la prioridad si el día es de esa zona. */
export function dayPatterns(template: DayTemplate, focus: PlanFocus): string[] {
  const patterns = [...DAY_PATTERNS[template]];
  if (focus === "balanced" || !TEMPLATE_REGIONS[template].includes(focus)) return patterns;
  const extra = EXTRA_PATTERNS[focus].find((pattern) => !patterns.includes(pattern));
  return extra ? [...patterns, extra] : patterns;
}
