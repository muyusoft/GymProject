import { describe, expect, it } from "vitest";
import type { SessionResult } from "@/shared/types/history.types";
import { previewIncrease, suggestIncrease } from "@/shared/utils/progression.utils";
import type { ExerciseTemplate } from "../types/workout.types";
import { isStagnated, suggestDeload } from "../utils/deload.utils";
import { buildHints } from "../utils/hints.utils";
import { buildInsight } from "../utils/insight.utils";

interface SessionOptions {
  date?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  rpe?: number | null;
  doneSets?: number;
}

function session({ date = "2026-09-28", weight = 15, reps = 12, sets = 4, rpe = null, doneSets = sets }: SessionOptions = {}): SessionResult {
  return {
    date,
    sets: Array.from({ length: sets }, (_, index) => ({
      weight,
      unit: "lb" as const,
      reps,
      rpe,
      completed: index < doneSets,
    })),
  };
}

const TARGET = { sets: 4, reps: 12 };
const BASE = { target: TARGET, step: 2.5, trackRpe: false };

describe("suggestIncrease", () => {
  it("sugiere peso + salto del equipo tras 2 sesiones completas al mismo peso", () => {
    expect(suggestIncrease({ ...BASE, history: [session(), session({ date: "2026-09-21" })] })).toBe(17.5);
  });

  it("no sugiere con una sola sesión", () => {
    expect(suggestIncrease({ ...BASE, history: [session()] })).toBeNull();
  });

  it("no sugiere si faltó una serie o quedaron reps por debajo del objetivo", () => {
    expect(suggestIncrease({ ...BASE, history: [session({ doneSets: 3 }), session()] })).toBeNull();
    expect(suggestIncrease({ ...BASE, history: [session({ reps: 10 }), session()] })).toBeNull();
  });

  it("no sugiere si el peso cambió entre las dos sesiones", () => {
    expect(suggestIncrease({ ...BASE, history: [session({ weight: 17.5 }), session()] })).toBeNull();
  });

  it("acepta más reps que el objetivo", () => {
    expect(suggestIncrease({ ...BASE, history: [session({ reps: 14 }), session({ reps: 13 })] })).toBe(17.5);
  });

  it("con RPE activado no sugiere si el esfuerzo medio fue 9 o más", () => {
    const hard = [session({ rpe: 9 }), session()];
    expect(suggestIncrease({ ...BASE, trackRpe: true, history: hard })).toBeNull();
    expect(suggestIncrease({ ...BASE, trackRpe: false, history: hard })).toBe(17.5);
    expect(suggestIncrease({ ...BASE, trackRpe: true, history: [session({ rpe: 8 }), session()] })).toBe(17.5);
  });

  it("no sugiere sin historial", () => {
    expect(suggestIncrease({ ...BASE, history: [] })).toBeNull();
  });
});

describe("previewIncrease", () => {
  it("anticipa la sugerencia cuando solo la última sesión está completa", () => {
    expect(previewIncrease({ ...BASE, history: [session()] })).toBe(17.5);
  });

  it("no anticipa si ya toca subir o si la última quedó incompleta", () => {
    expect(previewIncrease({ ...BASE, history: [session(), session()] })).toBeNull();
    expect(previewIncrease({ ...BASE, history: [session({ doneSets: 2 })] })).toBeNull();
  });
});

describe("deload", () => {
  const today = new Date(2026, 9, 2);
  const stalled = [
    session({ date: "2026-10-02", weight: 50, reps: 10 }),
    session({ date: "2026-09-25", weight: 50, reps: 10 }),
    session({ date: "2026-09-18", weight: 50, reps: 10 }),
    session({ date: "2026-09-04", weight: 50, reps: 10 }),
  ];

  it("detecta 3 semanas sin mejorar peso ni reps", () => {
    expect(isStagnated({ history: stalled, today })).toBe(true);
  });

  it("sugiere el 60% del peso redondeado al salto", () => {
    expect(suggestDeload({ history: stalled, today, step: 2.5 })).toBe(30);
    expect(suggestDeload({ history: stalled, today, step: 5 })).toBe(30);
  });

  it("no hay estancamiento si subió el peso o las reps", () => {
    const moreWeight = [session({ date: "2026-10-02", weight: 52.5, reps: 10 }), ...stalled.slice(1)];
    const moreReps = [session({ date: "2026-10-02", weight: 50, reps: 11 }), ...stalled.slice(1)];
    expect(isStagnated({ history: moreWeight, today })).toBe(false);
    expect(isStagnated({ history: moreReps, today })).toBe(false);
  });

  it("no sugiere sin sesión anterior a la ventana o con una sola reciente", () => {
    expect(isStagnated({ history: stalled.slice(0, 3), today })).toBe(false);
    expect(isStagnated({ history: [stalled[0]!, stalled[3]!], today })).toBe(false);
    expect(suggestDeload({ history: [], today, step: 2.5 })).toBeNull();
  });
});

const TEMPLATE: ExerciseTemplate = {
  sets: 4,
  reps: 12,
  seconds: null,
  restSec: 90,
  targetWeight: 15,
  unit: "lb",
  loadType: "per_arm",
  weightStep: 2.5,
};
const SETTINGS = { progressionSuggestions: true, trackRpe: false, autoDeload: true };

describe("buildInsight", () => {
  const history = [session(), session({ date: "2026-09-21" })];
  const today = new Date(2026, 9, 2);

  it("calcula la sugerencia de subir peso", () => {
    expect(buildInsight({ history, template: TEMPLATE, settings: SETTINGS, today }).increase).toBe(17.5);
  });

  it("respeta el interruptor de sugerencias de Ajustes", () => {
    const off = { ...SETTINGS, progressionSuggestions: false };
    expect(buildInsight({ history, template: TEMPLATE, settings: off, today })).toMatchObject({
      increase: null,
      preview: null,
    });
  });

  it("no sugiere nada para ejercicios por tiempo o sin peso", () => {
    const timed = { ...TEMPLATE, reps: null, targetWeight: null };
    expect(buildInsight({ history, template: timed, settings: SETTINGS, today })).toEqual({
      increase: null,
      preview: null,
      deload: null,
    });
  });
});

describe("buildHints", () => {
  const exercise = (id: string) => ({ exerciseId: id, nameEs: id, nameEn: id, template: TEMPLATE });

  it("devuelve un aviso de subir y uno de descarga como máximo", () => {
    const hints = buildHints([
      { exercise: exercise("a"), insight: { increase: 17.5, preview: null, deload: null } },
      { exercise: exercise("b"), insight: { increase: 20, preview: null, deload: null } },
      { exercise: exercise("c"), insight: { increase: null, preview: null, deload: 9 } },
    ]);
    expect(hints.map((hint) => [hint.kind, hint.exerciseId, hint.nextWeight])).toEqual([
      ["increase", "a", 17.5],
      ["deload", "c", 9],
    ]);
  });

  it("devuelve una lista vacía sin sugerencias", () => {
    expect(buildHints([{ exercise: exercise("a"), insight: { increase: null, preview: null, deload: null } }])).toEqual([]);
  });
});
