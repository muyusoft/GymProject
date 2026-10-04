import type { Language } from "@/shared/types/settings.types";
import { LANGUAGES } from "@/shared/types/settings.types";
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
}

export type AppSettingKey = keyof AppSettings;

const THEMES: readonly ThemePreference[] = ["auto", "light", "dark"];
const TRUE_VALUE = "true";
export const DEFAULT_REMINDER_HOUR = 18;
export const MAX_HOUR = 23;
export const MAX_MINUTE = 59;

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
  };
}
