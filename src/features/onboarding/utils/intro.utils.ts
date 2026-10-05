/** Mantiene el paso dentro de [0, total - 1]. */
export function clampStep(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(Math.round(index), 0), total - 1);
}

/** Paso visible según cuánto se deslizó la lista; con ancho 0 (antes de medir) es el primero. */
export function pageFromOffset(offsetX: number, pageWidth: number, total: number): number {
  if (pageWidth <= 0) return 0;
  return clampStep(offsetX / pageWidth, total);
}

export function isLastStep(index: number, total: number): boolean {
  return index >= total - 1;
}
