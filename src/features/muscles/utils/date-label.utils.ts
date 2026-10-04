import { parseISO } from "date-fns";

/** "2026-10-02" → "vie 2 oct" según el idioma. */
export function formatShortDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(parseISO(isoDate));
}

/** "2026-10-02" → "viernes, 2 de octubre" según el idioma. */
export function formatLongDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(parseISO(isoDate));
}
