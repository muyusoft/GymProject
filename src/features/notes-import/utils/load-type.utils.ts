import type { LoadType } from "@/shared/types/training.types";

const PER_ARM = /(?:en|para|por)\s+cada\s+brazo|por\s+brazo/;
const ON_PLATES = /en\s+discos/;

interface LoadTypeOptions {
  /** Texto que quedó de la línea sin peso, series ni descanso, en minúsculas y sin acentos. */
  modifiers: string;
  hasWeight: boolean;
  isTimed: boolean;
}

/**
 * "en cada brazo / para cada brazo / por brazo" → por brazo; "en discos" (con o sin "total") → discos;
 * "total" o "barra de" → total. Con peso y sin modificador se asume total; sin peso, peso corporal.
 */
export function detectLoadType({ modifiers, hasWeight, isTimed }: LoadTypeOptions): LoadType {
  if (isTimed) return "time";
  if (!hasWeight) return "bodyweight";
  if (PER_ARM.test(modifiers)) return "per_arm";
  if (ON_PLATES.test(modifiers)) return "plates";
  return "total";
}
