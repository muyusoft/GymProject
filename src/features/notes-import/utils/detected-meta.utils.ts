import { formatClock } from "@/shared/utils/duration.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { ParsedLine } from "../types/notes-import.types";

type TranslateFn = (key: string) => string;

interface MetaOptions {
  line: ParsedLine;
  locale: string;
  t: TranslateFn;
}

const SEPARATOR = " · ";

/** "88 lb · total · 4 × 12 · 1:30": lo que se entendió de la línea, para que el usuario lo revise. */
export function formatDetectedMeta({ line, locale, t }: MetaOptions): string {
  const work = line.reps ?? formatClock(line.seconds ?? 0);
  return [
    line.weight !== null && line.unit !== null
      ? formatWeight({ value: line.weight, unit: line.unit, locale })
      : null,
    t(`plan.loadType.${line.loadType}`).toLowerCase(),
    `${line.sets} × ${work}`,
    line.restSec !== null ? formatClock(line.restSec) : null,
  ]
    .filter((part): part is string => part !== null)
    .join(SEPARATOR);
}
