import type { Language, WeighInFrequency } from "@/shared/types/settings.types";
import { LANGUAGES, WEIGH_IN_FREQUENCIES } from "@/shared/types/settings.types";
import { UNIT_PREFERENCES, type UnitPreference } from "@/shared/types/training.types";
import { isOneOf } from "@/shared/utils/guard.utils";
import type { ThemePreference } from "./color-mode.utils";

export interface AppSettings {
  language: Language;
  weightUnit: UnitPreference;
  theme: ThemePreference;
  progressionSuggestions: boolean;
  trackRpe: boolean;
  autoDeload: boolean;
  reminderEnabled: boolean;
  /** Hora del recordatorio de entreno (0-23) y minuto (0-59). */
  reminderHour: number;
  reminderMinute: number;
  /** Estatura en cm, solo para el IMC; 0 = sin registrar. */
  heightCm: number;
  weighInFrequency: WeighInFrequency;
  weighInReminderEnabled: boolean;
  weighInReminderHour: number;
  weighInReminderMinute: number;
  /** Día del pesaje semanal: 0 = lunes … 6 = domingo. */
  weighInWeekday: number;
  /** La introducción y la bienvenida ya se mostraron; no vuelven a salir. */
  onboardingDone: boolean;
}

export type AppSettingKey = keyof AppSettings;

const THEMES: readonly ThemePreference[] = ["auto", "light", "dark"];
const TRUE_VALUE = "true";
export const DEFAULT_REMINDER_HOUR = 18;
export const MAX_HOUR = 23;
export const MAX_MINUTE = 59;
export const DEFAULT_WEIGH_IN_HOUR = 7;
export const MAX_WEEKDAY = 6;
export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 230;
export const HEIGHT_NOT_SET = 0;

export function serializeSetting(value: string | boolean | number): string {
  return String(value);
}

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  return raw === undefined ? fallback : raw === TRUE_VALUE;
}

function parseBoundedInt(raw: string | undefined, max: number, fallback: number): number {
  const value = Number(raw);
  return raw !== undefined && Number.isInteger(value) && value >= 0 && value <= max ? value : fallback;
}

function parseChoice<T extends string>(
  values: readonly T[],
  raw: string | undefined,
  fallback: T,
): T {
  return raw !== undefined && isOneOf(values, raw) ? raw : fallback;
}

/** Valores guardados (texto) → ajustes tipados; lo que falta o está corrupto cae al valor por defecto. */
export function parseSettings(
  raw: Readonly<Record<string, string>>,
  fallbackLanguage: Language,
): AppSettings {
  return {
    language: parseChoice(LANGUAGES, raw.language, fallbackLanguage),
    weightUnit: parseChoice(UNIT_PREFERENCES, raw.weightUnit, "per_exercise"),
    theme: parseChoice(THEMES, raw.theme, "auto"),
    progressionSuggestions: parseBoolean(raw.progressionSuggestions, true),
    trackRpe: parseBoolean(raw.trackRpe, false),
    autoDeload: parseBoolean(raw.autoDeload, true),
    reminderEnabled: parseBoolean(raw.reminderEnabled, false),
    reminderHour: parseBoundedInt(raw.reminderHour, MAX_HOUR, DEFAULT_REMINDER_HOUR),
    reminderMinute: parseBoundedInt(raw.reminderMinute, MAX_MINUTE, 0),
    heightCm: parseBoundedInt(raw.heightCm, MAX_HEIGHT_CM, HEIGHT_NOT_SET),
    weighInFrequency: parseChoice(WEIGH_IN_FREQUENCIES, raw.weighInFrequency, "daily"),
    weighInReminderEnabled: parseBoolean(raw.weighInReminderEnabled, false),
    weighInReminderHour: parseBoundedInt(raw.weighInReminderHour, MAX_HOUR, DEFAULT_WEIGH_IN_HOUR),
    weighInReminderMinute: parseBoundedInt(raw.weighInReminderMinute, MAX_MINUTE, 0),
    weighInWeekday: parseBoundedInt(raw.weighInWeekday, MAX_WEEKDAY, 0),
    onboardingDone: parseBoolean(raw.onboardingDone, false),
  };
}
