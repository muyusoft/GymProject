import { normalizeText } from "@/shared/utils/search.utils";
import { weekdayIndex } from "@/shared/utils/week.utils";
import type { DayHeader } from "../types/notes-import.types";

const WEEKDAYS: Readonly<Record<string, number>> = {
  lunes: 0,
  martes: 1,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  domingo: 6,
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

/** Por las tres primeras letras: acepta "septiembre", "sept" y "sep", en español e inglés. */
const MONTH_PREFIXES: Readonly<Record<string, number>> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
  jan: 0, apr: 3, aug: 7, dec: 11,
};

const HEADER = /^([a-z]+) (\d{1,2}) (?:de )?([a-z]+)$/;
const MONTH_PREFIX_LENGTH = 3;
const MAX_DAY = 31;

/** "Lunes 28 septiembre" o "Jueves 01 octubre" → día de la semana, día y mes. */
export function parseDayHeader(line: string): DayHeader | null {
  const text = normalizeText(line).replace(/[:,.]/g, " ").replace(/\s+/g, " ").trim();
  const match = HEADER.exec(text);
  if (!match) return null;
  const weekday = WEEKDAYS[match[1] ?? ""];
  const month = MONTH_PREFIXES[(match[3] ?? "").slice(0, MONTH_PREFIX_LENGTH)];
  const day = Number(match[2]);
  if (weekday === undefined || month === undefined || day < 1 || day > MAX_DAY) return null;
  return { weekday, day, month };
}

/** El encabezado no trae año: se elige el más cercano a hoy cuyo día de la semana coincide. */
export function resolveHeaderDate(header: DayHeader, today: Date): Date {
  const year = today.getFullYear();
  const candidates = [year - 1, year, year + 1].map((y) => new Date(y, header.month, header.day));
  const matching = candidates.filter((date) => weekdayIndex(date) === header.weekday);
  const pool = matching.length > 0 ? matching : [new Date(year, header.month, header.day)];
  return pool.reduce((best, date) =>
    Math.abs(date.getTime() - today.getTime()) < Math.abs(best.getTime() - today.getTime()) ? date : best,
  );
}
