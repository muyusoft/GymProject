import type {
  CatalogExercise,
  ExperienceLevel,
  GeneratedExercise,
  PlanAnswers,
  PlanGoal,
} from "../../types/plan-generator.types";
import { COMPOUND_PATTERNS } from "./templates";

interface RepRange {
  min: number;
  max: number;
}

interface GoalPrescription {
  compound: RepRange;
  isolation: RepRange;
  /** Descanso en segundos. */
  compoundRest: number;
  isolationRest: number;
}

/** Rangos y descansos por objetivo (acsm2009, schoenfeld2021loading, schoenfeld2016rest). */
const GOALS: Record<PlanGoal, GoalPrescription> = {
  muscle: { compound: { min: 8, max: 12 }, isolation: { min: 10, max: 15 }, compoundRest: 120, isolationRest: 90 },
  strength: { compound: { min: 4, max: 6 }, isolation: { min: 8, max: 12 }, compoundRest: 180, isolationRest: 90 },
  fat_loss: { compound: { min: 8, max: 12 }, isolation: { min: 10, max: 15 }, compoundRest: 90, isolationRest: 60 },
  fitness: { compound: { min: 10, max: 15 }, isolation: { min: 12, max: 15 }, compoundRest: 90, isolationRest: 60 },
};

/** Para quien empieza, la fuerza arranca con algo más de reps: aprender la técnica con cargas manejables. */
const BEGINNER_STRENGTH: RepRange = { min: 6, max: 8 };

const SETS: Record<ExperienceLevel, { compound: number; isolation: number }> = {
  beginner: { compound: 3, isolation: 2 },
  intermediate: { compound: 3, isolation: 3 },
  advanced: { compound: 4, isolation: 3 },
};

export const MIN_SETS = 2;
const TIMED_SECONDS = 45;

function setsFor(answers: PlanAnswers, isCompound: boolean): number {
  const base = SETS[answers.experience][isCompound ? "compound" : "isolation"];
  // Ponerse en forma: sesiones más cortas, una serie menos.
  return answers.goal === "fitness" ? Math.max(MIN_SETS, base - 1) : base;
}

function rangeFor(answers: PlanAnswers, isCompound: boolean): RepRange {
  if (isCompound && answers.goal === "strength" && answers.experience === "beginner") return BEGINNER_STRENGTH;
  return GOALS[answers.goal][isCompound ? "compound" : "isolation"];
}

/** Series, reps (como rango) y descanso de un ejercicio según objetivo y experiencia. El peso lo pone la primera sesión. */
export function prescribe(exercise: CatalogExercise, answers: PlanAnswers): GeneratedExercise {
  const isCompound = COMPOUND_PATTERNS.has(exercise.pattern);
  const goal = GOALS[answers.goal];
  const isTimed = exercise.loadType === "time";
  const range = rangeFor(answers, isCompound);
  return {
    exerciseId: exercise.id,
    pattern: exercise.pattern,
    isCompound,
    sets: setsFor(answers, isCompound),
    reps: isTimed ? null : range.max,
    repsMin: isTimed ? null : range.min,
    seconds: isTimed ? TIMED_SECONDS : null,
    restSec: isCompound ? goal.compoundRest : goal.isolationRest,
    loadType: exercise.loadType,
  };
}
