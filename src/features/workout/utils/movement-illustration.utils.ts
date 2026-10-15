import { MOVEMENT_ILLUSTRATION_NAMES, type MovementIllustrationName } from "@/shared/icons/movement-illustrations";
import { isOneOf } from "@/shared/utils/guard.utils";

/** La ilustración de un movimiento; null si aún no tiene (la ficha se muestra igual, sin dibujo). */
export function illustrationFor(movementId: string): MovementIllustrationName | null {
  return isOneOf(MOVEMENT_ILLUSTRATION_NAMES, movementId) ? movementId : null;
}
