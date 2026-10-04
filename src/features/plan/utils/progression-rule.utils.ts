export interface ProgressionRule {
  enabled: boolean;
  /** Sesiones seguidas completando series × reps antes de sugerir subir peso. */
  sessions: number;
}

export const DEFAULT_PROGRESSION_RULE: ProgressionRule = { enabled: true, sessions: 2 };

function isRule(value: unknown): value is ProgressionRule {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.enabled === "boolean" && typeof candidate.sessions === "number";
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
