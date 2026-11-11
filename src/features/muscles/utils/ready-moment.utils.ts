/** Franjas del día para decir cuándo estará listo un músculo ("el jue por la tarde"). */
export const DAY_BANDS = ["night", "morning", "afternoon", "evening"] as const;
export type DayBand = (typeof DAY_BANDS)[number];

export const READY_DAYS = ["today", "tomorrow", "weekday"] as const;
export type ReadyDay = (typeof READY_DAYS)[number];

export interface ReadyMoment {
  day: ReadyDay;
  band: DayBand;
}

/** Madrugada hasta las 6, mañana hasta las 12, tarde hasta las 19 y noche hasta las 24. */
const MORNING_FROM = 6;
const AFTERNOON_FROM = 12;
const EVENING_FROM = 19;
const MS_PER_DAY = 86_400_000;

function bandOf(hour: number): DayBand {
  if (hour < MORNING_FROM) return "night";
  if (hour < AFTERNOON_FROM) return "morning";
  return hour < EVENING_FROM ? "afternoon" : "evening";
}

function startOfDay(value: number): number {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Hoy, mañana o un día de la semana, con la franja en hora local. Como mucho son 72 h: nunca pasa de una semana. */
export function readyMoment(readyAt: number, now: number): ReadyMoment {
  const days = Math.round((startOfDay(readyAt) - startOfDay(now)) / MS_PER_DAY);
  const band = bandOf(new Date(readyAt).getHours());
  if (days <= 0) return { day: "today", band };
  return { day: days === 1 ? "tomorrow" : "weekday", band };
}
