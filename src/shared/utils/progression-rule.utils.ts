export interface ProgressionRule {
  enabled: boolean;
  /** Sesiones seguidas completando series × reps antes de sugerir subir peso. */
  sessions: number;
  /** Mínimo del rango de repeticiones (doble progresión). Sin él, el objetivo es un número fijo. */
  repsMin?: number;
}

export const DEFAULT_PROGRESSION_RULE: ProgressionRule = {
  enabled: true,
  sessions: 2,
};

const RANGE_SEPARATOR = "–";

function isRule(value: unknown): value is ProgressionRule {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const hasValidRange =
    candidate.repsMin === undefined || typeof candidate.repsMin === "number";
  return (
    typeof candidate.enabled === "boolean" &&
    typeof candidate.sessions === "number" &&
    hasValidRange
  );
}

/** Un JSON ausente o dañado no debe romper la pantalla: cae a la regla por defecto. */
export function parseProgressionRule(json: string | null): ProgressionRule {
  if (!json) return DEFAULT_PROGRESSION_RULE;
  try {
    const parsed: unknown = JSON.parse(json);
    return isRule(parsed) ? parsed : DEFAULT_PROGRESSION_RULE;
  } catch {
    return DEFAULT_PROGRESSION_RULE;
  }
}

export function serializeProgressionRule(rule: ProgressionRule): string {
  return JSON.stringify(rule);
}

/** El mínimo del rango si de verdad hay rango (1 o más y por debajo del objetivo); si no, null. */
export function repRangeMin(
  rule: ProgressionRule,
  reps: number | null,
): number | null {
  const { repsMin } = rule;
  if (repsMin === undefined || reps === null) return null;
  return repsMin >= 1 && repsMin < reps ? repsMin : null;
}

/** "12" con objetivo fijo, "8–12" con rango. */
export function formatReps(reps: number, repsMin: number | null): string {
  return repsMin === null
    ? String(reps)
    : `${repsMin}${RANGE_SEPARATOR}${reps}`;
}
