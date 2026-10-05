/** Cómo se sintió un ejercicio, según las repeticiones que quedaban en reserva al terminarlo. */
export const EFFORT_LEVELS = ["easy", "solid", "limit"] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

/** Desde este RPE el ejercicio se hizo al límite: no se sugiere subir peso y la recuperación tarda más. */
export const LIMIT_RPE = 9;
const SOLID_RPE = 8;

/**
 * La respuesta se guarda como RPE para que progresión, recuperación y descarga usen el mismo dato:
 * sobraron 3 o más ≈ 7, sobraron 1 o 2 ≈ 8.5, al límite = 10.
 */
const EFFORT_RPE: Record<EffortLevel, number> = {
  easy: 7,
  solid: 8.5,
  limit: 10,
};

export function effortToRpe(level: EffortLevel): number {
  return EFFORT_RPE[level];
}

export function rpeToEffort(rpe: number | null): EffortLevel | null {
  if (rpe === null) return null;
  if (rpe >= LIMIT_RPE) return "limit";
  return rpe >= SOLID_RPE ? "solid" : "easy";
}

/** Esfuerzo de un ejercicio a partir de sus series; las que no tienen dato no cuentan. */
export function effortOfSets(
  sets: readonly { rpe: number | null }[],
): EffortLevel | null {
  const values = sets.flatMap((set) => (set.rpe === null ? [] : [set.rpe]));
  if (values.length === 0) return null;
  return rpeToEffort(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}
