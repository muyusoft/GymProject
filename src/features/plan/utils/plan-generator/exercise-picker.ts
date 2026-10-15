import type { GymEquipment } from "@/shared/types/equipment.types";
import { canPerform } from "@/shared/utils/equipment-requirements.utils";
import type {
  CatalogExercise,
  ExperienceLevel,
} from "../../types/plan-generator.types";

type Preferences = Readonly<Record<string, readonly string[]>>;

/** Para quien empieza: máquinas y variantes guiadas, más fáciles de aprender y de cargar con seguridad. */
const GUIDED: Preferences = {
  horizontal_push: ["Press de pecho en máquina", "Press banca con mancuernas", "Press inclinado con mancuernas"],
  vertical_push: ["Press de hombros en máquina", "Press de hombros con mancuernas"],
  horizontal_pull: ["Remo en máquina", "Remo sentado en polea", "Remo con pecho apoyado", "Remo con mancuerna a una mano", "Remo invertido"],
  vertical_pull: ["Jalón al pecho agarre abierto", "Jalón al pecho agarre cerrado", "Jalón agarre supino"],
  squat: ["Prensa de piernas", "Sentadilla en máquina (péndulo)", "Sentadilla goblet", "Hack squat", "Sentadilla con mancuernas"],
  lunge: ["Step-up con mancuernas", "Zancada inversa"],
  hinge_rdl: ["Peso muerto piernas rígidas (mancuernas)", "Hiperextensiones"],
  hip_thrust: ["Hip thrust", "Puente de glúteo", "Puente de glúteo a una pierna"],
};

/** Con experiencia: barra libre primero. */
const FREE: Preferences = {
  horizontal_push: ["Press banca con barra", "Press inclinado con mancuernas", "Press banca con mancuernas"],
  vertical_push: ["Press militar con barra", "Press de hombros con mancuernas"],
  horizontal_pull: ["Remo con barra", "Remo con mancuerna a una mano", "Remo sentado en polea", "Remo invertido"],
  vertical_pull: ["Jalón al pecho agarre abierto", "Jalón agarre supino", "Jalón al pecho agarre cerrado", "Dominadas", "Pullover con mancuerna"],
  squat: ["Sentadilla con barra", "Hack squat", "Prensa de piernas", "Sentadilla en máquina (péndulo)", "Sentadilla con mancuernas"],
  lunge: ["Sentadilla búlgara", "Zancadas caminando"],
  hinge_rdl: ["Peso muerto rumano", "Peso muerto piernas rígidas (mancuernas)"],
  hip_thrust: ["Hip thrust", "Puente de glúteo", "Puente de glúteo a una pierna"],
};

/** Aislamiento: igual para todos los niveles. */
const ISOLATION: Preferences = {
  fly: ["Pec deck / mariposa", "Cruce de poleas"],
  lateral_raise: ["Elevaciones laterales con mancuernas", "Elevación lateral en polea"],
  rear_delt: ["Reverse pec deck", "Face pull"],
  shrug: ["Encogimientos con mancuernas"],
  knee_extension: ["Extensión de cuádriceps"],
  knee_flexion: ["Curl femoral acostado", "Curl femoral sentado"],
  hip_abduction: ["Abductores en máquina"],
  hip_adduction: ["Aductores en máquina"],
  calf_standing: ["Pantorrillas de pie", "Pantorrillas de pie con mancuerna"],
  calf_seated: ["Pantorrillas sentado", "Pantorrilla sentado con mancuerna"],
  elbow_flexion: ["Curl con mancuernas alterno", "Curl en polea", "Curl martillo"],
  elbow_extension: ["Extensión de tríceps con cuerda", "Extensión sobre la cabeza con cuerda", "Extensión de tríceps en polea"],
  core: ["Crunch en polea", "Elevación de piernas colgado", "Rueda abdominal"],
};

/** Con carga hay progresión de peso; el peso corporal solo se usa si no queda otra (o en el core). */
function isLoadable(exercise: CatalogExercise): boolean {
  return exercise.pattern === "core" || (exercise.loadType !== "bodyweight" && exercise.loadType !== "time");
}

/** Primero los preferidos (en su orden), después el resto con carga, y al final los de peso corporal. */
function rankCandidates(
  candidates: readonly CatalogExercise[],
  preferred: readonly string[],
): CatalogExercise[] {
  const byName = (name: string) => candidates.find((exercise) => exercise.nameEs === name);
  const first = preferred.flatMap((name) => byName(name) ?? []);
  const rest = candidates.filter((exercise) => !first.includes(exercise));
  const ranked = [...first.filter(isLoadable), ...rest.filter(isLoadable)];
  return ranked.length > 0 ? ranked : [...first, ...rest];
}

export interface ExercisePicker {
  /** Un ejercicio para el patrón; null si el catálogo no tiene ninguno con músculos con fuente. */
  pick: (pattern: string) => CatalogExercise | null;
}

/**
 * Elige ejercicios del catálogo por patrón. Solo usa los que tienen músculos con fuente (nunca se inventan) y
 * los que se pueden hacer con el equipo disponible.
 * Cada vez que un patrón se repite en la semana toma la siguiente variante de su lista.
 */
interface PickerOptions {
  experience: ExperienceLevel;
  /** El equipo disponible: solo se eligen ejercicios que se puedan hacer con él. */
  equipment: readonly GymEquipment[];
}

export function createExercisePicker(
  catalog: readonly CatalogExercise[],
  { experience, equipment }: PickerOptions,
): ExercisePicker {
  const compound = experience === "beginner" ? GUIDED : FREE;
  const available = new Set(equipment);
  const usable = catalog.filter((exercise) => exercise.muscles.length > 0 && canPerform(exercise.requires, available));
  const uses = new Map<string, number>();
  return {
    pick(pattern) {
      const candidates = usable.filter((exercise) => exercise.pattern === pattern);
      const ranked = rankCandidates(candidates, compound[pattern] ?? ISOLATION[pattern] ?? []);
      if (ranked.length === 0) return null;
      const used = uses.get(pattern) ?? 0;
      uses.set(pattern, used + 1);
      return ranked[used % ranked.length] ?? null;
    },
  };
}
