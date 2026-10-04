import { describe, expect, it } from "vitest";
import type { ExerciseSession, LoggedSetRow, ProgressData } from "../types/progress.types";
import { buildExerciseProgress, topExercises } from "../utils/exercise-sessions.utils";
import { buildFeaturedSeries, isLatestRecord } from "../utils/featured.utils";
import { formatSessionSummary, historyStats, pickDisplayUnit } from "../utils/history-stats.utils";
import { monthSessionStats } from "../utils/month-sessions.utils";
import { filterPickerItems } from "../utils/picker.utils";
import { buildProgressView } from "../utils/progress-view.utils";
import { buildBuckets, maxPerBucket, rangeStartIso } from "../utils/range.utils";
import { recentRecords } from "../utils/records-list.utils";
import { buildSessionResults, deriveTarget } from "../utils/session-results.utils";
import { percentChange, trendOf } from "../utils/trend.utils";
import { setVolumeKg, weeklyVolumes } from "../utils/volume.utils";

const NOW = new Date(2026, 9, 2, 12);

function row(overrides: Partial<LoggedSetRow>): LoggedSetRow {
  return {
    sessionId: "s1",
    date: "2026-09-28",
    exerciseId: "e1",
    nameEs: "Press de banca",
    nameEn: "Bench press",
    weight: 100,
    unit: "kg",
    reps: 5,
    rpe: null,
    loadType: "total",
    isPR: false,
    ...overrides,
  };
}

function session(date: string, oneRepMaxKg: number, overrides: Partial<ExerciseSession> = {}): ExerciseSession {
  return {
    sessionId: date,
    date,
    dayName: null,
    best: { weight: 30, unit: "kg", reps: 12, loadType: "total", oneRepMaxKg },
    completedSets: 4,
    volumeKg: 1440,
    ...overrides,
  };
}

const countBuckets = (buckets: ReturnType<typeof buildBuckets>) => buckets.length;

describe("buildBuckets", () => {
  it("Mes son 4 semanas, 3 meses son 12 semanas y Año son 12 meses", () => {
    expect(countBuckets(buildBuckets({ range: "month", now: NOW }))).toBe(4);
    expect(countBuckets(buildBuckets({ range: "quarter", now: NOW }))).toBe(12);
    expect(countBuckets(buildBuckets({ range: "year", now: NOW }))).toBe(12);
  });

  it("el último periodo es el actual y el primero arranca donde corresponde", () => {
    const weeks = buildBuckets({ range: "month", now: NOW });
    expect(rangeStartIso(weeks)).toBe("2026-09-07");
    expect(weeks[3]?.start.getDate()).toBe(28);
    expect(rangeStartIso(buildBuckets({ range: "year", now: NOW }))).toBe("2025-11-01");
  });
});

describe("maxPerBucket", () => {
  const buckets = buildBuckets({ range: "month", now: NOW });

  it("toma el mayor valor de cada periodo y deja vacíos los demás", () => {
    const values = maxPerBucket(
      [
        { date: "2026-09-10", value: 90 },
        { date: "2026-09-12", value: 95 },
        { date: "2026-09-29", value: 100 },
      ],
      buckets,
    );
    expect(values).toEqual([95, null, null, 100]);
  });

  it("ignora lo que cae fuera del rango", () => {
    expect(maxPerBucket([{ date: "2026-01-01", value: 50 }], buckets)).toEqual([null, null, null, null]);
  });
});

describe("tendencias", () => {
  it("distingue sube, igual y baja", () => {
    expect(trendOf(80, 88.5)).toEqual({ direction: "up", delta: 8.5 });
    expect(trendOf(80, 80)).toEqual({ direction: "same", delta: 0 });
    expect(trendOf(80, 75)).toEqual({ direction: "down", delta: -5 });
  });

  it("calcula el cambio relativo y evita dividir entre cero", () => {
    expect(percentChange(100, 108)).toBeCloseTo(0.08);
    expect(percentChange(0, 50)).toBeNull();
  });
});

describe("volumen", () => {
  it("cuenta peso × reps, los dos brazos en carga por brazo, y nada sin peso", () => {
    expect(setVolumeKg({ weight: 100, unit: "kg", reps: 10, loadType: "total" })).toBe(1000);
    expect(setVolumeKg({ weight: 20, unit: "kg", reps: 10, loadType: "per_arm" })).toBe(400);
    expect(setVolumeKg({ weight: null, unit: "kg", reps: 20, loadType: "bodyweight" })).toBe(0);
    expect(setVolumeKg({ weight: 100, unit: "lb", reps: 10, loadType: "total" })).toBeCloseTo(453.59, 2);
  });

  it("separa la semana actual de la anterior y deja fuera el resto", () => {
    const sets = [
      { date: "2026-09-29", weight: 100, unit: "kg" as const, reps: 10, loadType: "total" as const },
      { date: "2026-09-22", weight: 20, unit: "kg" as const, reps: 10, loadType: "per_arm" as const },
      { date: "2026-09-10", weight: 999, unit: "kg" as const, reps: 10, loadType: "total" as const },
    ];
    expect(weeklyVolumes({ sets, now: NOW })).toEqual({ current: 1000, previous: 400 });
  });
});

describe("monthSessionStats", () => {
  const today = new Date(2026, 8, 25);
  const sessions = ["2026-09-04", "2026-09-07", "2026-09-11", "2026-09-18", "2026-08-31"].map((date) => ({ id: date, date }));

  it("compara las sesiones del mes con las que el plan preveía hasta hoy", () => {
    expect(monthSessionStats({ sessions, plannedWeekdays: [0, 4], today })).toEqual({ done: 4, planned: 7, percent: 57 });
  });

  it("no da porcentaje si el plan no preveía entrenos", () => {
    expect(monthSessionStats({ sessions, plannedWeekdays: [], today }).percent).toBeNull();
  });
});

describe("buildExerciseProgress", () => {
  const rows = [
    row({ sessionId: "s1", date: "2026-09-28", weight: 100, reps: 5 }),
    row({ sessionId: "s1", date: "2026-09-28", weight: 90, reps: 8 }),
    row({ sessionId: "s2", date: "2026-10-02", weight: 105, reps: 5 }),
    row({ exerciseId: "e2", nameEs: "Plancha", weight: null, reps: null, loadType: "time" }),
  ];
  const [press] = buildExerciseProgress(rows);

  it("resume cada sesión con su mejor serie, series y volumen, de la más nueva a la más vieja", () => {
    expect(press?.sessions.map((item) => item.date)).toEqual(["2026-10-02", "2026-09-28"]);
    expect(press?.sessions[1]).toMatchObject({ completedSets: 2, volumeKg: 1220 });
    expect(press?.sessions[1]?.best).toMatchObject({ weight: 100, reps: 5 });
  });

  it("deja fuera los ejercicios sin peso ni reps", () => {
    expect(buildExerciseProgress(rows)).toHaveLength(1);
  });

  it("ordena los ejercicios por sesiones en el periodo", () => {
    const more = [...rows, row({ exerciseId: "e3", nameEs: "Remo", sessionId: "s1" }), row({ exerciseId: "e3", nameEs: "Remo", sessionId: "s2", date: "2026-10-02" }), row({ exerciseId: "e3", nameEs: "Remo", sessionId: "s3", date: "2026-10-01" })];
    const top = topExercises({ progress: buildExerciseProgress(more), from: "2026-09-01", limit: 5 });
    expect(top.map((item) => [item.exerciseId, item.count])).toEqual([["e3", 3], ["e1", 2]]);
  });
});

describe("serie del ejercicio destacado", () => {
  const buckets = buildBuckets({ range: "month", now: NOW });
  const sessions = [session("2026-09-29", 120), session("2026-09-10", 100)];

  it("lleva el 1RM de cada periodo, su tendencia y cuántos periodos abarca", () => {
    const series = buildFeaturedSeries({ sessions, buckets, unit: "kg" });
    expect(series.bars).toEqual([100, null, null, 120]);
    expect(series).toMatchObject({ current: 120, span: 4, trend: { direction: "up", delta: 20 } });
  });

  it("convierte a la unidad de pantalla", () => {
    const series = buildFeaturedSeries({ sessions, buckets, unit: "lb" });
    expect(series.bars[0]).toBeCloseTo(220.46, 2);
  });

  it("sin sesiones en el periodo no hay marca ni tendencia", () => {
    expect(buildFeaturedSeries({ sessions: [], buckets, unit: "kg" })).toMatchObject({ current: null, trend: null, span: 0 });
  });

  it("reconoce que la sesión más reciente es un récord solo si supera a todas las anteriores", () => {
    expect(isLatestRecord(sessions)).toBe(true);
    expect(isLatestRecord([session("2026-09-29", 95), session("2026-09-10", 100)])).toBe(false);
    expect(isLatestRecord([session("2026-09-29", 120)])).toBe(false);
  });
});

describe("recentRecords", () => {
  it("devuelve un récord por ejercicio, el más reciente, y ordena por fecha", () => {
    const rows = [
      row({ date: "2026-09-28", weight: 100, reps: 5, isPR: true }),
      row({ date: "2026-10-02", weight: 105, reps: 5, isPR: true }),
      row({ exerciseId: "e2", nameEs: "Peso muerto", date: "2026-09-30", weight: 140, reps: 5, isPR: true }),
      row({ exerciseId: "e3", nameEs: "Remo", date: "2026-10-01", isPR: false }),
    ];
    const records = recentRecords(rows, 3);
    expect(records.map((record) => [record.exerciseId, record.weight, record.reps])).toEqual([
      ["e1", 105, 5],
      ["e2", 140, 5],
    ]);
  });

  it("respeta el límite", () => {
    const rows = ["a", "b", "c", "d"].map((id, index) => row({ exerciseId: id, date: `2026-09-0${index + 1}`, isPR: true }));
    expect(recentRecords(rows, 3)).toHaveLength(3);
  });
});

describe("estadísticas del historial", () => {
  const sessions = [session("2026-10-02", 42, { volumeKg: 1400 }), session("2026-09-28", 40, { volumeKg: 1200 })];

  it("saca el mejor 1RM, la mejor serie y el volumen medio por sesión", () => {
    expect(historyStats(sessions)).toMatchObject({ oneRepMaxKg: 42, averageVolumeKg: 1300 });
    expect(historyStats([])).toBeNull();
  });

  it("resume la sesión como series × reps · peso", () => {
    expect(formatSessionSummary({ session: sessions[0] as ExerciseSession, locale: "es" })).toBe("4 × 12 · 30 kg");
  });

  it("elige la unidad de pantalla según Ajustes", () => {
    expect(pickDisplayUnit("lb", "kg")).toBe("lb");
    expect(pickDisplayUnit("per_exercise", "lb")).toBe("lb");
    expect(pickDisplayUnit("per_exercise", undefined)).toBe("kg");
  });
});

describe("buildProgressView", () => {
  const data: ProgressData = {
    generatedAt: NOW.getTime(),
    plannedWeekdays: [0, 4],
    sessions: [
      { id: "s1", date: "2026-09-28" },
      { id: "s2", date: "2026-10-02" },
    ],
    sets: [
      row({ sessionId: "s1", date: "2026-09-28", weight: 100, reps: 5 }),
      row({ sessionId: "s1", date: "2026-09-28", weight: 90, reps: 8 }),
      row({ sessionId: "s2", date: "2026-10-02", weight: 105, reps: 5, isPR: true }),
    ],
  };
  const view = buildProgressView({ data, range: "quarter", preference: "kg", selectedId: null });

  it("destaca el ejercicio más entrenado con su 1RM y marca el récord", () => {
    expect(view.featured).toMatchObject({ exerciseId: "e1", unit: "kg", isRecord: true, spanUnit: "weeks" });
    expect(view.featured?.current).toBeCloseTo(122.5);
    expect(view.picker.map((item) => [item.exerciseId, item.count])).toEqual([["e1", 2]]);
  });

  it("suma el volumen de la semana y, sin semana anterior, no da cambio", () => {
    expect(view.volume.tonnes).toBeCloseTo(1.745);
    expect(view.volume.change).toBeNull();
  });

  it("incluye las sesiones del mes y los récords recientes", () => {
    expect(view.month).toMatchObject({ done: 1, planned: 1 });
    expect(view.records.map((record) => record.exerciseId)).toEqual(["e1"]);
  });

  it("respeta el ejercicio elegido y cae al más entrenado si ya no tiene datos", () => {
    expect(buildProgressView({ data, range: "quarter", preference: "kg", selectedId: "nope" }).featured?.exerciseId).toBe("e1");
  });

  it("sin sesiones marca la vista como vacía", () => {
    const empty = buildProgressView({ data: { ...data, sets: [], sessions: [] }, range: "month", preference: "kg", selectedId: null });
    expect(empty).toMatchObject({ isEmpty: true, featured: null, records: [] });
  });
});

describe("resultados por sesión para la regla de subir peso", () => {
  const rows = [
    row({ sessionId: "s2", date: "2026-10-02", weight: 30, reps: 12 }),
    row({ sessionId: "s2", date: "2026-10-02", weight: 30, reps: 12 }),
    row({ sessionId: "s1", date: "2026-09-28", weight: 30, reps: 10 }),
  ];

  it("agrupa las series por sesión y conserva el orden de más nueva a más vieja", () => {
    const results = buildSessionResults(rows);
    expect(results.map((result) => [result.date, result.sets.length])).toEqual([
      ["2026-10-02", 2],
      ["2026-09-28", 1],
    ]);
    expect(results[0]?.sets.every((set) => set.completed)).toBe(true);
  });

  it("toma lo esperado del plan y, sin plan, de la última sesión (reps mínimas)", () => {
    const results = buildSessionResults(rows);
    expect(deriveTarget({ sets: 4, reps: 12 }, results[0])).toEqual({ sets: 4, reps: 12 });
    expect(deriveTarget(null, results[0])).toEqual({ sets: 2, reps: 12 });
    expect(deriveTarget({ sets: 3, reps: null }, results[1])).toEqual({ sets: 1, reps: 10 });
    expect(deriveTarget(null, undefined)).toBeNull();
  });
});

describe("selector de ejercicio", () => {
  const exercises = ["e1", "e2", "e3", "e4", "e5", "e6"];
  const sets = exercises.flatMap((exerciseId, index) =>
    Array.from({ length: exercises.length - index }, (_, sessionIndex) =>
      row({ exerciseId, nameEs: `Ejercicio ${exerciseId}`, sessionId: `${exerciseId}-${sessionIndex}`, date: "2026-09-29" }),
    ),
  );
  const data: ProgressData = { generatedAt: NOW.getTime(), plannedWeekdays: [], sessions: [{ id: "x", date: "2026-09-29" }], sets };

  it("muestra los 5 más entrenados y deja todos en el selector completo", () => {
    const view = buildProgressView({ data, range: "quarter", preference: "kg", selectedId: null });
    expect(view.picker.map((item) => item.exerciseId)).toEqual(["e1", "e2", "e3", "e4", "e5"]);
    expect(view.all.map((item) => item.exerciseId)).toEqual(exercises);
  });

  it("agrega a los chips el ejercicio elegido aunque no sea de los más entrenados", () => {
    const view = buildProgressView({ data, range: "quarter", preference: "kg", selectedId: "e6" });
    expect(view.featured?.exerciseId).toBe("e6");
    expect(view.picker.map((item) => item.exerciseId)).toEqual(["e1", "e2", "e3", "e4", "e5", "e6"]);
  });
});

describe("filterPickerItems", () => {
  const items = [
    { exerciseId: "a", nameEs: "Press de banca", nameEn: "Bench press", count: 3 },
    { exerciseId: "b", nameEs: "Jalón al pecho", nameEn: "Lat pulldown", count: 2 },
  ];

  it("busca en español e inglés sin acentos", () => {
    expect(filterPickerItems(items, "jalon").map((item) => item.exerciseId)).toEqual(["b"]);
    expect(filterPickerItems(items, "BENCH").map((item) => item.exerciseId)).toEqual(["a"]);
  });

  it("sin texto devuelve todo y sin coincidencias devuelve vacío", () => {
    expect(filterPickerItems(items, "  ")).toHaveLength(2);
    expect(filterPickerItems(items, "zzz")).toEqual([]);
  });
});
