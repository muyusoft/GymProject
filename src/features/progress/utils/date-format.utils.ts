import { parseISO } from "date-fns";

/** "2026-10-02" → "vie 2 oct" / "Fri, Oct 2" según el idioma. */
export function formatShortDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(parseISO(isoDate));
}

/** Rótulo del eje de las gráficas: día y mes en semanas, solo el mes en meses. */
export function formatAxisLabel(date: Date, unit: "weeks" | "months", locale: string): string {
  const options: Intl.DateTimeFormatOptions =
    unit === "weeks" ? { day: "numeric", month: "short" } : { month: "short" };
  return new Intl.DateTimeFormat(locale, options).format(date);
}
