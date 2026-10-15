import type { MuscleGroup } from "@/shared/types/training.types";
import type { BodyRegion, Movement, MovementDose } from "../types/warmup.types";

const reps = (amount: number, isPerSide = false): MovementDose => ({ amount, unit: "reps", isPerSide });
const steps = (amount: number): MovementDose => ({ amount, unit: "steps", isPerSide: true });
const seconds = (amount: number, isPerSide = false): MovementDose => ({ amount, unit: "seconds", isPerSide });

const STRETCH_HOLD = 30;
const WARMUP_STEPS = 4;
const STRETCH_STEPS = 4;

interface WarmupSpec {
  id: string;
  region: BodyRegion;
  targets: readonly MuscleGroup[];
  dose: MovementDose;
  needsBand?: boolean;
}

/** Calentamiento dinámico: minutos antes de entrenar ayuda; estático largo, no (Behm 2016). */
function warmup({ id, region, targets, dose, needsBand = false }: WarmupSpec): Movement {
  return { id, kind: "warmup", region, targets, needsBand, dose, stepCount: WARMUP_STEPS, sources: ["fradkin2010", "behm2016"] };
}

/** Estiramiento estático de 30 s: dentro de los 10-30 s del ACSM (Garber 2011); se presenta como movilidad (Herbert 2011). */
function stretch(id: string, region: BodyRegion, targets: readonly MuscleGroup[]): Movement {
  return {
    id,
    kind: "stretch",
    region,
    targets,
    needsBand: false,
    dose: seconds(STRETCH_HOLD, true),
    stepCount: STRETCH_STEPS,
    sources: ["garber2011", "behm2016", "herbert2011"],
  };
}

export const WARMUP_MOVEMENTS: readonly Movement[] = [
  warmup({ id: "jumpingJacks", region: "general", targets: [], dose: seconds(30) }),
  warmup({ id: "walkingKneeHug", region: "general", targets: ["gluteal", "hamstring"], dose: reps(10, true) }),
  warmup({ id: "armCircles", region: "general", targets: ["deltoids"], dose: reps(10) }),
  warmup({ id: "catCamel", region: "general", targets: ["lower-back", "abs"], dose: reps(8) }),
  warmup({ id: "bodyweightSquat", region: "lower", targets: ["quadriceps", "gluteal"], dose: reps(10) }),
  warmup({ id: "lungeTwist", region: "lower", targets: ["quadriceps", "gluteal", "obliques"], dose: reps(6, true) }),
  warmup({ id: "legSwingFront", region: "lower", targets: ["hamstring", "gluteal"], dose: reps(10, true) }),
  warmup({ id: "legSwingSide", region: "lower", targets: ["adductors", "gluteal"], dose: reps(10, true) }),
  warmup({ id: "gluteBridge", region: "lower", targets: ["gluteal", "hamstring"], dose: reps(12) }),
  warmup({ id: "hipHinge", region: "lower", targets: ["hamstring", "lower-back"], dose: reps(10) }),
  warmup({ id: "ankleRock", region: "lower", targets: ["calves"], dose: reps(10, true) }),
  warmup({ id: "bandLateralWalk", region: "lower", targets: ["gluteal"], dose: steps(12), needsBand: true }),
  warmup({ id: "bandMonsterWalk", region: "lower", targets: ["gluteal"], dose: steps(10), needsBand: true }),
  warmup({ id: "bandGluteBridge", region: "lower", targets: ["gluteal", "hamstring"], dose: reps(15), needsBand: true }),
  warmup({ id: "thoracicRotation", region: "upper", targets: ["upper-back", "obliques"], dose: reps(8, true) }),
  warmup({ id: "scapularPushUp", region: "upper", targets: ["chest", "upper-back"], dose: reps(10) }),
  warmup({ id: "wallSlide", region: "upper", targets: ["deltoids", "trapezius"], dose: reps(10) }),
  warmup({ id: "bandPullApart", region: "upper", targets: ["upper-back", "deltoids"], dose: reps(15), needsBand: true }),
  warmup({ id: "bandDislocate", region: "upper", targets: ["deltoids", "chest"], dose: reps(10), needsBand: true }),
  warmup({ id: "bandExternalRotation", region: "upper", targets: ["deltoids"], dose: reps(12, true), needsBand: true }),
];

export const STRETCH_MOVEMENTS: readonly Movement[] = [
  stretch("standingQuad", "lower", ["quadriceps"]),
  stretch("seatedHamstring", "lower", ["hamstring"]),
  stretch("kneelingHipFlexor", "lower", ["quadriceps", "gluteal"]),
  stretch("figureFour", "lower", ["gluteal"]),
  stretch("butterfly", "lower", ["adductors"]),
  stretch("wallCalf", "lower", ["calves"]),
  stretch("doorwayChest", "upper", ["chest", "deltoids"]),
  stretch("wallLat", "upper", ["upper-back"]),
  stretch("crossBodyShoulder", "upper", ["deltoids"]),
  stretch("overheadTriceps", "upper", ["triceps"]),
  stretch("childPose", "general", ["lower-back", "upper-back"]),
  stretch("gentleCobra", "general", ["abs"]),
];
