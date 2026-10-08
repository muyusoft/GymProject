import { describe, expect, it } from "vitest";
import type { ExerciseTemplate, SessionSet } from "../types/workout.types";
import {
  adjustRest,
  formatElapsed,
  remainingSeconds,
  ringFraction,
} from "../utils/elapsed.utils";
import {
  groupHistory,
  MAX_SESSIONS_PER_EXERCISE,
  type HistoryRow,
} from "../utils/history.utils";
import { buildInitialSets, nextSetValues } from "../utils/session-plan.utils";
import {
  countDoneSets,
  countTotalSets,
  getSetStatuses,
  isExerciseDone,
  sessionProgress,
} from "../utils/session-stats.utils";

const sets = (...done: boolean[]) =>
  done.map((completed, index) => ({ id: `s${index}`, completed }));

describe("session stats", () => {
  const exercises = [
    { sets: sets(true, true, false, false) },
    { sets: sets(true) },
  ];

  it("cuenta series hechas y totales", () => {
    expect(countTotalSets(exercises)).toBe(5);
    expect(countDoneSets(exercises)).toBe(3);
  });

  it("calcula el progreso entre 0 y 1", () => {
    expect(sessionProgress(exercises)).toBeCloseTo(0.6);
    expect(sessionProgress([])).toBe(0);
  });

  it("un ejercicio está hecho solo con todas sus series", () => {
    expect(isExerciseDone(exercises[0]!)).toBe(false);
    expect(isExerciseDone(exercises[1]!)).toBe(true);
    expect(isExerciseDone({ sets: [] })).toBe(false);
  });

  it("marca como activa solo la primera serie pendiente", () => {
    const statuses = getSetStatuses(sets(true, false, false));
    expect([...statuses.values()]).toEqual(["done", "active", "pending"]);
  });
});

describe("elapsed y descanso", () => {
  it("formatea el reloj de la sesión", () => {
    expect(formatElapsed(372_000)).toBe("06:12");
    expect(formatElapsed(5_000)).toBe("00:05");
    expect(formatElapsed(3_909_000)).toBe("1:05:09");
    expect(formatElapsed(-1)).toBe("00:00");
  });

  it("calcula lo que falta desde la hora de fin, no desde un contador", () => {
    expect(remainingSeconds(10_000, 0)).toBe(10);
    expect(remainingSeconds(10_000, 9_001)).toBe(1);
    expect(remainingSeconds(10_000, 12_000)).toBe(0);
  });

  it("calcula la fracción del anillo con tope", () => {
    expect(ringFraction(45, 90)).toBe(0.5);
    expect(ringFraction(100, 90)).toBe(1);
    expect(ringFraction(5, 0)).toBe(0);
  });

  it("suma y resta 15 s sin terminar antes de ahora", () => {
    expect(
      adjustRest({ endsAt: 60_000, totalSec: 90, deltaSec: 15, now: 0 }),
    ).toEqual({ endsAt: 75_000, totalSec: 105 });
    expect(
      adjustRest({ endsAt: 5_000, totalSec: 90, deltaSec: -15, now: 0 }),
    ).toEqual({ endsAt: 0, totalSec: 75 });
  });
});

const TEMPLATE: ExerciseTemplate = {
  sets: 3,
  reps: 12,
  seconds: null,
  restSec: 90,
  targetWeight: 88,
  unit: "lb",
  loadType: "total",
  weightStep: 5,
  weightSteps: { lb: 10, kg: 5 },
  repsMin: null,
  isProgressionEnabled: true,
};

describe("buildInitialSets", () => {
  let counter = 0;
  const createId = () => `id-${++counter}`;
  const base = {
    sessionId: "ses",
    exerciseId: "ex",
    template: TEMPLATE,
    createId,
  };

  it("crea todas las series pendientes con los valores de la plantilla", () => {
    const rows = buildInitialSets(base);
    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.setIndex)).toEqual([0, 1, 2]);
    expect(
      rows.every(
        (row) =>
          row.weight === 88 && row.reps === 12 && row.completed === false,
      ),
    ).toBe(true);
  });

  it("con rango de reps arranca con la meta de hoy", () => {
    const latest = {
      date: "2026-10-01",
      sets: [
        {
          weight: 88,
          unit: "lb" as const,
          reps: 9,
          rpe: null,
          completed: true,
        },
      ],
    };
    const rows = buildInitialSets({
      ...base,
      template: { ...TEMPLATE, repsMin: 8 },
      latest,
    });
    expect(rows.every((row) => row.weight === 88 && row.reps === 10)).toBe(
      true,
    );
  });

  it("usa segundos y no reps en un ejercicio por tiempo", () => {
    const timed = {
      ...TEMPLATE,
      reps: null,
      seconds: 90,
      targetWeight: null,
      loadType: "time" as const,
    };
    const [first] = buildInitialSets({
      ...base,
      template: timed,
    });
    expect(first).toMatchObject({ reps: null, seconds: 90, weight: null });
  });
});

describe("nextSetValues", () => {
  it("repite la última serie o, sin ella, la plantilla", () => {
    const last: SessionSet = {
      id: "x",
      index: 2,
      weight: 90,
      unit: "lb",
      reps: 10,
      seconds: null,
      loadType: "total",
      completed: true,
      isPR: false,
      rpe: null,
    };
    expect(nextSetValues(last, TEMPLATE)).toMatchObject({
      weight: 90,
      reps: 10,
    });
    expect(nextSetValues(undefined, TEMPLATE)).toMatchObject({
      weight: 88,
      reps: 12,
    });
  });
});

describe("groupHistory", () => {
  const row = (
    sessionId: string,
    date: string,
    exerciseId = "e1",
  ): HistoryRow => ({
    exerciseId,
    sessionId,
    date,
    weight: 15,
    unit: "lb",
    reps: 12,
    rpe: null,
    completed: true,
  });

  it("agrupa por ejercicio y sesión conservando el orden de más nueva a más vieja", () => {
    const grouped = groupHistory([
      row("b", "2026-10-02"),
      row("b", "2026-10-02"),
      row("a", "2026-09-25"),
      row("c", "2026-10-02", "e2"),
    ]);
    expect(
      grouped.get("e1")?.map((session) => [session.date, session.sets.length]),
    ).toEqual([
      ["2026-10-02", 2],
      ["2026-09-25", 1],
    ]);
    expect(grouped.get("e2")).toHaveLength(1);
  });

  it("limita las sesiones por ejercicio", () => {
    const rows = Array.from(
      { length: MAX_SESSIONS_PER_EXERCISE + 5 },
      (_, index) => row(`s${index}`, "2026-01-01"),
    );
    expect(groupHistory(rows).get("e1")).toHaveLength(
      MAX_SESSIONS_PER_EXERCISE,
    );
  });
});
