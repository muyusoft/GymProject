import type { WeighInFrequency } from "@/shared/types/settings.types";

const DAYS_IN_WEEK = 7;
const CLOCK_PAD = 2;

export interface ReminderDay {
  /** 0 = lunes … 6 = domingo (el plan). */
  weekday: number;
  name: string;
}

export interface ReminderSlot {
  /** Día de la notificación: 1 = domingo … 7 = sábado (lo que pide expo-notifications). */
  weekday: number;
  hour: number;
  minute: number;
  dayName: string;
}

/** Lunes (0) → 2 … sábado (5) → 7, domingo (6) → 1. */
export function toNotificationWeekday(planWeekday: number): number {
  return ((planWeekday + 1) % DAYS_IN_WEEK) + 1;
}

interface SlotOptions {
  days: readonly ReminderDay[];
  hour: number;
  minute: number;
}

/** Un aviso semanal por cada día de entreno del plan, a la hora elegida; un día repetido cuenta una vez. */
export function buildReminderSlots({ days, hour, minute }: SlotOptions): ReminderSlot[] {
  const byWeekday = new Map<number, ReminderDay>();
  for (const day of days) {
    if (!byWeekday.has(day.weekday)) byWeekday.set(day.weekday, day);
  }
  return [...byWeekday.values()]
    .sort((a, b) => a.weekday - b.weekday)
    .map((day) => ({ weekday: toNotificationWeekday(day.weekday), hour, minute, dayName: day.name }));
}

export interface WeighInSlot {
  /** null = todos los días; si no, 1 = domingo … 7 = sábado (lo que pide expo-notifications). */
  weekday: number | null;
  hour: number;
  minute: number;
}

interface WeighInSlotOptions {
  frequency: WeighInFrequency;
  /** Día del pesaje semanal: 0 = lunes … 6 = domingo. */
  weekday: number;
  hour: number;
  minute: number;
}

/** A diario: un aviso cada día. Cada semana: uno solo, el día elegido. */
export function buildWeighInSlot({ frequency, weekday, hour, minute }: WeighInSlotOptions): WeighInSlot {
  return { weekday: frequency === "daily" ? null : toNotificationWeekday(weekday), hour, minute };
}

/** 18, 5 → "18:05". */
export function formatReminderTime(hour: number, minute: number): string {
  return `${String(hour).padStart(CLOCK_PAD, "0")}:${String(minute).padStart(CLOCK_PAD, "0")}`;
}
