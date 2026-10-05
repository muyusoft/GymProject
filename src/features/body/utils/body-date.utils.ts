import { parseISO } from "date-fns";

/** "2026-10-04" → "4 oct" / "Oct 4" según el idioma. */
export function formatDayMonth(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(parseISO(isoDate));
}
