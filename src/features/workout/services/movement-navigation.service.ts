import { router } from "expo-router";

/** Abre la ficha de un movimiento (cómo se hace, para qué sirve y sus fuentes). */
export function openMovementInfo(id: string): void {
  router.push({ pathname: "/movement/[id]", params: { id } });
}
