import type {
  Equipment,
  LoadType,
  MuscleCategory,
  MuscleGroup,
  MuscleView,
  WeightUnit,
} from "@/shared/types/training.types";

export interface PrimaryMuscle {
  group: MuscleGroup;
  view: MuscleView;
}

export interface PlanUsage {
  /** Días de la semana (0 = lunes) en que el ejercicio está en el plan. */
  weekdays: number[];
  targetWeight: number | null;
  unit: WeightUnit;
}

export interface LibraryExercise {
  id: string;
  nameEs: string;
  nameEn: string;
  aliases: string[];
  equipment: Equipment;
  defaultLoadType: LoadType;
  primary: PrimaryMuscle[];
  category: MuscleCategory | null;
  plan: PlanUsage | null;
}

export interface LibraryData {
  exercises: LibraryExercise[];
  /** Día del plan al que se está agregando (0 = lunes), o null si solo se explora. */
  targetWeekday: number | null;
}

export interface LibraryFilters {
  query: string;
  category: MuscleCategory | null;
  equipment: Equipment | null;
}

export type LibraryRow =
  | { kind: "section"; key: "inPlan" | "more" }
  | { kind: "exercise"; exercise: LibraryExercise };
