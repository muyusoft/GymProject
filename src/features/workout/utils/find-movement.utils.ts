import { STRETCH_MOVEMENTS, WARMUP_MOVEMENTS } from "../data/movements";
import type { Movement } from "../types/warmup.types";

/** El movimiento de calentamiento o estiramiento con ese id; null si no existe. */
export function findMovement(id: string): Movement | null {
  return [...WARMUP_MOVEMENTS, ...STRETCH_MOVEMENTS].find((movement) => movement.id === id) ?? null;
}
