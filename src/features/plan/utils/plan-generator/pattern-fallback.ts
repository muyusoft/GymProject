/**
 * Si el equipo no deja hacer un patrón, otro que trabaje casi los mismos músculos (según muscle-map.json).
 * Patrones sin sustituto razonable (encogimientos, por ejemplo) simplemente se omiten.
 */
export const FALLBACK_PATTERNS: Readonly<Record<string, string>> = {
  vertical_pull: "horizontal_pull",
  horizontal_pull: "vertical_pull",
  horizontal_push: "dip",
  dip: "horizontal_push",
  vertical_push: "lateral_raise",
  lateral_raise: "vertical_push",
  fly: "horizontal_push",
  rear_delt: "horizontal_pull",
  squat: "lunge",
  lunge: "squat",
  hinge_rdl: "hip_thrust",
  hip_thrust: "hinge_rdl",
  knee_extension: "lunge",
  knee_flexion: "hinge_rdl",
  hip_abduction: "hip_thrust",
  hip_adduction: "lunge",
  calf_standing: "calf_seated",
  calf_seated: "calf_standing",
};

/** Los tirones de espalda se pueden repetir en el mismo día: sin jalón, dos remos siguen siendo el trabajo de espalda. */
const REPEATABLE: ReadonlySet<string> = new Set(["horizontal_pull", "vertical_pull"]);

/** El sustituto de un patrón para un día, o null si no hay o el día ya lo tiene (salvo los tirones). */
export function fallbackFor(pattern: string, dayPatterns: readonly string[]): string | null {
  const fallback = FALLBACK_PATTERNS[pattern];
  if (!fallback) return null;
  return REPEATABLE.has(fallback) || !dayPatterns.includes(fallback) ? fallback : null;
}
