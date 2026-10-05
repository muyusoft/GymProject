import { MUSCLE_GROUPS, type MuscleGroup, type MuscleRole } from "@/shared/types/training.types";
import type {
  GroupRecovery,
  MuscleLink,
  RecoveryCause,
  RecoverySet,
  RecoveryState,
} from "../types/muscles.types";

/** Horas requeridas tras una sesión (regla de producto inspirada en Morán-Navarro et al. 2017). */
export const PRIMARY_RECOVERY_HOURS = 48;
export const SECONDARY_RECOVERY_HOURS = 24;
export const HARD_SET_EXTRA_HOURS = 24;
export const HARD_RPE = 9;
/** Con RPE 9 o más en un grupo principal se necesitan 72 h: más allá de eso todo está listo. */
export const RECOVERY_HORIZON_HOURS = PRIMARY_RECOVERY_HOURS + HARD_SET_EXTRA_HOURS;

const MS_PER_HOUR = 3_600_000;
const WORKED_BELOW = 0.5;

/** Menos de 50%: recién trabajado; de 50 a 99%: recuperando; 100%: listo. */
export function recoveryState(percent: number): RecoveryState {
  if (percent < WORKED_BELOW) return "worked";
  return percent < 1 ? "recovering" : "ready";
}

interface SessionImpact {
  endedAt: number;
  role: MuscleRole;
  isHard: boolean;
  cause: RecoveryCause;
}

function requiredHours({ role, isHard }: Pick<SessionImpact, "role" | "isHard">): number {
  const base = role === "primary" ? PRIMARY_RECOVERY_HOURS : SECONDARY_RECOVERY_HOURS;
  return base + (isHard ? HARD_SET_EXTRA_HOURS : 0);
}

/** Qué le hizo cada sesión a cada grupo: el rol más exigente, si hubo una serie muy dura y qué ejercicio fue. */
function collectImpacts(sets: readonly RecoverySet[], links: readonly MuscleLink[]): Map<string, SessionImpact> {
  const linksByExercise = new Map<string, MuscleLink[]>();
  for (const link of links) {
    linksByExercise.set(link.exerciseId, [...(linksByExercise.get(link.exerciseId) ?? []), link]);
  }
  const impacts = new Map<string, SessionImpact>();
  for (const set of sets) {
    for (const link of linksByExercise.get(set.exerciseId) ?? []) {
      const key = `${link.group}|${set.sessionId}`;
      const current = impacts.get(key);
      const isHard = (current?.isHard ?? false) || (set.rpe ?? 0) >= HARD_RPE;
      const isStronger = !current || (link.role === "primary" && current.role === "secondary");
      impacts.set(key, {
        endedAt: set.endedAt,
        role: isStronger ? link.role : (current?.role ?? link.role),
        isHard,
        cause: isStronger
          ? { exerciseId: set.exerciseId, nameEs: set.nameEs, nameEn: set.nameEn }
          : (current?.cause ?? { exerciseId: set.exerciseId, nameEs: set.nameEs, nameEn: set.nameEn }),
      });
    }
  }
  return impacts;
}

function recoverGroup(group: MuscleGroup, impacts: ReadonlyMap<string, SessionImpact>, now: number): GroupRecovery {
  const own = [...impacts.entries()].filter(([key]) => key.startsWith(`${group}|`)).map(([, impact]) => impact);
  const scored = own.map((impact) => ({
    impact,
    percent: Math.min(1, Math.max(0, (now - impact.endedAt) / MS_PER_HOUR / requiredHours(impact))),
  }));
<<<<<<< Updated upstream
  const limiting = scored.sort((a, b) => a.percent - b.percent)[0];
=======
  // [...].sort en vez de toSorted: Hermes no trae los métodos de arreglo de ES2023.
  const limiting = [...scored].sort((a, b) => a.percent - b.percent)[0];
>>>>>>> Stashed changes
  const latest = own.reduce<number | null>((max, impact) => (max === null ? impact.endedAt : Math.max(max, impact.endedAt)), null);
  if (!limiting) return { group, state: "ready", percent: 1, role: null, lastWorkedAt: null, cause: null };
  return {
    group,
    state: recoveryState(limiting.percent),
    percent: limiting.percent,
    role: limiting.impact.role,
    lastWorkedAt: limiting.percent < 1 ? limiting.impact.endedAt : latest,
    cause: limiting.impact.cause,
  };
}

interface RecoveryOptions {
  sets: readonly RecoverySet[];
  links: readonly MuscleLink[];
  /** Ahora, en ms desde epoch. */
  now: number;
}

/**
 * Recuperación de cada grupo muscular: tras una sesión se requieren 48 h si fue principal y 24 h si fue
 * secundario, más 24 h si alguna serie tuvo RPE 9 o más. Con varias sesiones cuenta la más exigente pendiente.
 */
export function computeRecovery({ sets, links, now }: RecoveryOptions): GroupRecovery[] {
  const impacts = collectImpacts(sets, links);
  return MUSCLE_GROUPS.map((group) => recoverGroup(group, impacts, now));
}
