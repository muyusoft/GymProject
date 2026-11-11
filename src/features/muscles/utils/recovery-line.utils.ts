import { joinGroupNames } from "./group-labels.utils";
import { readyMoment } from "./ready-moment.utils";
import { relativeDay, type RecoveryLine } from "./recovery-view.utils";

export type RecoveryTranslate = (
  key: string,
  options?: { count?: number; hours?: number; when?: string; weekday?: string },
) => string;

interface LineTextOptions {
  t: RecoveryTranslate;
  locale: string;
  now: number;
}

const SEPARATOR = " · ";

const shortWeekday = (timestamp: number, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "short" }).format(timestamp);

/** "Femoral y gemelos" o, con porcentaje, "Glúteos y cuádriceps · 55%". */
export function lineTitle(line: RecoveryLine, t: RecoveryTranslate): string {
  const names = joinGroupNames(line.groups, (key) => t(key));
  return line.percent === null ? names : `${names}${SEPARATOR}${line.percent}%`;
}

/** "lun 27 · ayer" según el idioma; null sin registro. */
export function workedDayLabel(line: RecoveryLine, { t, locale, now }: LineTextOptions): string | null {
  if (line.workedAt === null) return null;
  const day = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(line.workedAt);
  const relative = relativeDay(line.workedAt, now);
  const label = relative.kind === "daysAgo" ? t("recovery.daysAgo", { count: relative.days }) : t(`recovery.${relative.kind}`);
  return `${day}${SEPARATOR}${label}`;
}

/** "el jue por la tarde"; null si ya está listo. */
export function readyWhen(readyAt: number | null, { t, locale, now }: LineTextOptions): string | null {
  if (readyAt === null) return null;
  const { day, band } = readyMoment(readyAt, now);
  return t(`recovery.when.${day}.${band}`, { weekday: shortWeekday(readyAt, locale) });
}

/** La segunda línea: por qué tarda (si fue al límite) y cuándo estará listo. */
export function lineDetail(line: RecoveryLine, options: LineTextOptions): string | null {
  const when = readyWhen(line.readyAt, options);
  if (when === null) return null;
  const { t } = options;
  return line.hardHours === null
    ? t("recovery.line.ready", { when })
    : t("recovery.line.hardReady", { hours: line.hardHours, when });
}
