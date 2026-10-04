import { describe, expect, it } from "vitest";
import type { PlanExerciseRow } from "@/shared/db/types";
import {
  draftFromPlanExercise,
  draftToPatch,
  loadTypeUsesTime,
  loadTypeUsesWeight,
  switchUnit,
} from "../utils/exercise-config.utils";
import { formatExerciseSubtitle } from "../utils/exercise-subtitle.utils";
import {
  DEFAULT_PROGRESSION_RULE,
  parseProgressionRule,
  serializeProgressionRule,
} from "../utils/progression-rule.utils";

const ROW: PlanExerciseRow = {
  id: "x",
  planDayId: "d",
  exerciseId: "e",
  order: 0,
  sets: 4,
  reps: 12,
  seconds: null,
  restSec: 90,
  targetWeight: 30,
  unit: "lb",
  loadType: "per_arm",
  progressionRule: null,
  updatedAt: 0,
};

const t = (key: string) =>
  ({
    "plan.load.suffix.per_arm": "c/brazo",
    "plan.load.suffix.total": "",
    "plan.load.timeSuffix": "de tiempo",
    "plan.load.rest": "descanso",
  })[key] ?? key;

describe("formatExerciseSubtitle", () => {
  it("muestra peso, series × reps y descanso", () => {
    expect(formatExerciseSubtitle({ exercise: ROW, t, locale: "es" })).toBe(
      "30 lb c/brazo · 4 × 12 · 1:30",
    );
  });

  it("omite el sufijo cuando la carga es total", () => {
    const total = { ...ROW, loadType: "total" as const, targetWeight: 27.5 };
    expect(formatExerciseSubtitle({ exercise: total, t, locale: "es" })).toBe(
      "27,5 lb · 4 × 12 · 1:30",
    );
  });

  it("describe un ejercicio por tiempo", () => {
    const plank = { ...ROW, loadType: "time" as const, sets: 3, seconds: 90, reps: null, restSec: 120 };
    expect(formatExerciseSubtitle({ exercise: plank, t, locale: "es" })).toBe(
      "3 × 1:30 de tiempo · descanso 2:00",
    );
  });

  it("omite el peso del ejercicio de peso corporal", () => {
    const body = { ...ROW, loadType: "bodyweight" as const, targetWeight: null };
    expect(formatExerciseSubtitle({ exercise: body, t, locale: "es" })).toBe("4 × 12 · 1:30");
  });
});

describe("load type helpers", () => {
  it("usa peso solo en carga por brazo, total y discos", () => {
    expect(["per_arm", "total", "plates"].every((l) => loadTypeUsesWeight(l as never))).toBe(true);
    expect(loadTypeUsesWeight("bodyweight")).toBe(false);
    expect(loadTypeUsesWeight("time")).toBe(false);
    expect(loadTypeUsesTime("time")).toBe(true);
  });

});

describe("draftToPatch", () => {
  it("guarda reps y peso, sin segundos, en un ejercicio de reps", () => {
    const patch = draftToPatch(draftFromPlanExercise(ROW), null);
    expect(patch).toMatchObject({ targetWeight: 30, reps: 12, seconds: null });
  });

  it("guarda segundos y no peso ni reps en un ejercicio por tiempo", () => {
    const draft = { ...draftFromPlanExercise(ROW), loadType: "time" as const, seconds: 90 };
    expect(draftToPatch(draft, null)).toMatchObject({ targetWeight: null, reps: null, seconds: 90 });
  });

  it("conserva las sesiones de la regla y cambia solo el interruptor", () => {
    const rule = serializeProgressionRule({ enabled: true, sessions: 3 });
    const draft = { ...draftFromPlanExercise(ROW), isProgressionEnabled: false };
    const patch = draftToPatch(draft, rule);
    expect(parseProgressionRule(patch.progressionRule ?? null)).toEqual({ enabled: false, sessions: 3 });
  });
});

describe("parseProgressionRule", () => {
  it("usa la regla por defecto si falta o está dañada", () => {
    expect(parseProgressionRule(null)).toEqual(DEFAULT_PROGRESSION_RULE);
    expect(parseProgressionRule("{not json")).toEqual(DEFAULT_PROGRESSION_RULE);
    expect(parseProgressionRule('{"enabled":"yes"}')).toEqual(DEFAULT_PROGRESSION_RULE);
  });
});

describe("switchUnit", () => {
  it("convierte y redondea al salto de la unidad nueva", () => {
    expect(switchUnit({ weight: 30, from: "lb", to: "kg", step: 2.5 })).toBe(12.5);
  });

  it("no cambia nada si la unidad es la misma", () => {
    expect(switchUnit({ weight: 32.5, from: "kg", to: "kg", step: 2.5 })).toBe(32.5);
  });
});
