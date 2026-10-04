import type { exerciseMuscles, exercises } from "./schema/catalog";
import type { planDays, planExercises, plans } from "./schema/plan";
import type { equipmentIncrements } from "./schema/settings";

export type ExerciseRow = typeof exercises.$inferSelect;
export type ExerciseMuscleRow = typeof exerciseMuscles.$inferSelect;
export type PlanRow = typeof plans.$inferSelect;
export type PlanDayRow = typeof planDays.$inferSelect;
export type PlanExerciseRow = typeof planExercises.$inferSelect;
export type EquipmentIncrementRow = typeof equipmentIncrements.$inferSelect;

export type NewPlanDay = Omit<typeof planDays.$inferInsert, "id" | "updatedAt">;
export type NewPlanExercise = Omit<
  typeof planExercises.$inferInsert,
  "id" | "updatedAt"
>;

export type PlanDayPatch = Partial<
  Pick<
    PlanDayRow,
    "name" | "weekday" | "order" | "defaultSets" | "defaultReps" | "defaultRestSec"
  >
>;
export type PlanExercisePatch = Partial<
  Pick<
    PlanExerciseRow,
    | "sets"
    | "reps"
    | "seconds"
    | "restSec"
    | "targetWeight"
    | "unit"
    | "loadType"
    | "progressionRule"
  >
>;
