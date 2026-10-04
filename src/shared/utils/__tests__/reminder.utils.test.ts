import { describe, expect, it } from "vitest";
import { buildReminderSlots, formatReminderTime, toNotificationWeekday } from "../reminder.utils";

describe("toNotificationWeekday", () => {
  it("pasa de lunes = 0 a domingo = 1 de expo-notifications", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(toNotificationWeekday)).toEqual([2, 3, 4, 5, 6, 7, 1]);
  });
});

describe("buildReminderSlots", () => {
  const days = [
    { weekday: 4, name: "Espalda" },
    { weekday: 0, name: "Hombro" },
    { weekday: 6, name: "Largo" },
  ];

  it("crea un aviso por día de entreno, ordenado por día y a la hora elegida", () => {
    expect(buildReminderSlots({ days, hour: 18, minute: 30 })).toEqual([
      { weekday: 2, hour: 18, minute: 30, dayName: "Hombro" },
      { weekday: 6, hour: 18, minute: 30, dayName: "Espalda" },
      { weekday: 1, hour: 18, minute: 30, dayName: "Largo" },
    ]);
  });

  it("no repite un día de la semana", () => {
    const repeated = [...days, { weekday: 0, name: "Otro lunes" }];
    expect(buildReminderSlots({ days: repeated, hour: 7, minute: 0 })).toHaveLength(3);
  });

  it("sin días de entreno no hay avisos", () => {
    expect(buildReminderSlots({ days: [], hour: 18, minute: 0 })).toEqual([]);
  });
});

describe("formatReminderTime", () => {
  it("formatea con cero a la izquierda", () => {
    expect(formatReminderTime(18, 0)).toBe("18:00");
    expect(formatReminderTime(7, 5)).toBe("07:05");
    expect(formatReminderTime(0, 45)).toBe("00:45");
  });
});
