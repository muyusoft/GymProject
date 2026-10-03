import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import i18n from "@/config/i18n";

const getLocale = () => (i18n.language === "es" ? es : enUS);

export const dateUtils = {
  /**
   * Formatea una fecha en formato corto: "12 de enero de 2025" (ES) o "January 12, 2025" (EN)
   */
  formatDate(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "Invalid date";
    return format(d, "PPP", { locale: getLocale() });
  },

  /**
   * Formatea con hora: "12 de enero de 2025 a las 14:30"
   */
  formatDateTime(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "Invalid date";
    return format(d, "PPP p", { locale: getLocale() });
  },

  /**
   * Tiempo relativo: "hace 5 minutos", "in 2 hours"
   */
  formatRelative(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "Invalid date";
    return formatDistanceToNow(d, { addSuffix: true, locale: getLocale() });
  },

  /**
   * Solo hora: "14:30"
   */
  formatTime(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "Invalid date";
    return format(d, "p", { locale: getLocale() });
  },

  /**
   * ISO para APIs: "2025-01-12T14:30:00Z"
   */
  toISO(date: Date): string {
    return date.toISOString();
  },

  /**
   * Hoy
   */
  today(): Date {
    return new Date();
  },
};
