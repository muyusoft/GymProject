import { describe, expect, it } from "vitest";
import { buildMonthGrid, toIsoDate } from "@/shared/utils/week.utils";
import type { WeekStripDay } from "../types/workout.types";
import { buildPastWeek, buildWeekPages, listWeekStarts, weekIndexOf } from "../utils/week-history.utils";

/** Domingo 4 de octubre de 2026: su semana empieza el lunes 28 de septiembre. */
const TODAY = new Date(2026, 9, 4, 18);

describe("listWeekStarts", () => {
  it("va del lunes de la primera sesión al lunes de la semana actual", () => {
    expect(listWeekStarts("2026-09-16", TODAY).map(toIsoDate)).toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
  });

  it("sin sesiones, o con la primera en esta semana, solo hay la semana actual", () => {
    expect(listWeekStarts(null, TODAY).map(toIsoDate)).toEqual(["2026-09-28"]);
    expect(listWeekStarts("2026-10-01", TODAY).map(toIsoDate)).toEqual(["2026-09-28"]);
  });

  it("una fecha futura no agrega semanas", () => {
    expect(listWeekStarts("2026-11-20", TODAY)).toHaveLength(1);
  });
});

describe("buildPastWeek", () => {
  const week = buildPastWeek(new Date(2026, 8, 21), new Set(["2026-09-21", "2026-09-25"]));

  it("marca hecho o sin entreno, nunca planificado ni hoy", () => {
    expect(week.map((day) => day.status)).toEqual(["done", "none", "none", "none", "done", "none", "none"]);
    expect(week.some((day) => day.isToday)).toBe(false);
  });

  it("va de lunes a domingo", () => {
    expect(week.map((day) => day.weekday)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(week.map((day) => day.date.getDate())).toEqual([21, 22, 23, 24, 25, 26, 27]);
  });
});

describe("buildWeekPages y weekIndexOf", () => {
  const currentWeek: WeekStripDay[] = [{ date: new Date(2026, 8, 28), weekday: 0, status: "planned", isToday: false }];
  const pages = buildWeekPages({ trainedDates: ["2026-09-16", "2026-09-25"], today: TODAY, currentWeek });

  it("deja la semana actual al final, tal como la calculó el plan", () => {
    expect(pages.map((page) => page.key)).toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
    expect(pages[2]?.days).toEqual(currentWeek);
    expect(pages[0]?.days[2]?.status).toBe("done");
    expect(pages[1]?.days[4]?.status).toBe("done");
  });

  it("encuentra la página de una fecha y descarta las que quedan fuera", () => {
    expect(weekIndexOf(pages, new Date(2026, 8, 20))).toBe(0);
    expect(weekIndexOf(pages, new Date(2026, 9, 4))).toBe(2);
    expect(weekIndexOf(pages, new Date(2026, 8, 13))).toBeNull();
    expect(weekIndexOf(pages, new Date(2026, 9, 5))).toBeNull();
  });
});

describe("buildMonthGrid", () => {
  it("arma filas de lunes a domingo con huecos para los días de otros meses", () => {
    const grid = buildMonthGrid(new Date(2026, 9, 15));
    expect(grid).toHaveLength(5);
    expect(grid[0]?.map((date) => date?.getDate() ?? null)).toEqual([null, null, null, 1, 2, 3, 4]);
    expect(grid[4]?.map((date) => date?.getDate() ?? null)).toEqual([26, 27, 28, 29, 30, 31, null]);
  });

  it("incluye todos los días del mes una sola vez", () => {
    const days = buildMonthGrid(new Date(2026, 1, 1)).flat().filter((date) => date !== null);
    expect(days).toHaveLength(28);
    expect(buildMonthGrid(new Date(2026, 1, 1))).toHaveLength(5);
  });

  it("un mes que empieza en domingo ocupa seis filas", () => {
    expect(buildMonthGrid(new Date(2026, 10, 1))).toHaveLength(6);
  });
});
