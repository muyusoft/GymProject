import { addWeeks, differenceInCalendarWeeks, parseISO } from "date-fns";
import { startOfWeekMonday, toIsoDate, weekDates } from "@/shared/utils/week.utils";
import type { WeekStripDay } from "../types/workout.types";

/** Tope de seguridad: unos 10 años de semanas. */
const MAX_WEEKS = 520;
const MONDAY = 1;

export interface WeekPage {
  /** Lunes de la semana, yyyy-MM-dd. */
  key: string;
  days: WeekStripDay[];
}

/** Los lunes desde la semana de la primera sesión hasta la semana actual; sin sesiones, solo la actual. */
export function listWeekStarts(firstDate: string | null, today: Date): Date[] {
  const current = startOfWeekMonday(today);
  const first = firstDate ? startOfWeekMonday(parseISO(firstDate)) : current;
  const span = differenceInCalendarWeeks(current, first, { weekStartsOn: MONDAY });
  const count = Math.min(Math.max(span, 0), MAX_WEEKS - 1) + 1;
  return Array.from({ length: count }, (_, index) => addWeeks(current, index - (count - 1)));
}

/** Una semana pasada: cada día está hecho o sin entreno. No se dice "planificado" porque el plan pudo cambiar. */
export function buildPastWeek(weekStart: Date, trainedDates: ReadonlySet<string>): WeekStripDay[] {
  return weekDates(weekStart).map((date, weekday) => ({
    date,
    weekday,
    status: trainedDates.has(toIsoDate(date)) ? "done" : "none",
    isToday: false,
  }));
}

interface WeekPagesOptions {
  /** Fechas (yyyy-MM-dd) con una sesión terminada, de la más vieja a la más nueva. */
  trainedDates: readonly string[];
  today: Date;
  /** La semana actual ya calculada con el plan (hecho, planificado, descanso). */
  currentWeek: readonly WeekStripDay[];
}

/** Las páginas de la franja, de la semana más vieja a la actual (la última). */
export function buildWeekPages({ trainedDates, today, currentWeek }: WeekPagesOptions): WeekPage[] {
  const trained = new Set(trainedDates);
  const starts = listWeekStarts(trainedDates[0] ?? null, today);
  return starts.map((start, index) => ({
    key: toIsoDate(start),
    days: index === starts.length - 1 ? [...currentWeek] : buildPastWeek(start, trained),
  }));
}

/** En qué página cae una fecha; null si es anterior a la primera semana o posterior a la actual. */
export function weekIndexOf(pages: readonly WeekPage[], date: Date): number | null {
  const index = pages.findIndex((page) => page.key === toIsoDate(startOfWeekMonday(date)));
  return index === -1 ? null : index;
}
