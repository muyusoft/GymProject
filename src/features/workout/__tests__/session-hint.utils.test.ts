import { describe, expect, it } from "vitest";
import type {
  ExerciseInsight,
  SessionExercise,
  SessionSet,
} from "../types/workout.types";
import { pickSessionHint, repsAfterApply } from "../utils/session-hint.utils";

const NO_INSIGHT: ExerciseInsight = {
  increase: null,
  preview: null,
  deload: null,
};

function set(id: string, weight: number | null, completed = false): SessionSet {
  return {
    id,
    index: 0,
    weight,
    unit: "kg",
    reps: 12,
    seconds: null,
    loadType: "total",
    completed,
    isPR: false,
    rpe: null,
  };
}

function exercise(
  insight: Partial<ExerciseInsight>,
  sets: SessionSet[],
  repsMin: number | null = null,
): SessionExercise {
  return {
    slot: {
      planExerciseId: "plan",
      originalExerciseId: "ex",
      isSubstituted: false,
    },
    exerciseId: "ex",
    nameEs: "Press",
    nameEn: "Press",
    template: {
      sets: sets.length,
      reps: 12,
      repsMin,
      seconds: null,
      restSec: 90,
      targetWeight: 80,
      unit: "kg",
      loadType: "total",
      weightStep: 2.5,
      weightSteps: { lb: 5, kg: 2.5 },
      isProgressionEnabled: true,
    },
    sets,
    insight: { ...NO_INSIGHT, ...insight },
    last: null,
  };
}

describe("pickSessionHint", () => {
  it("ofrece subir mientras quede una serie pendiente por debajo del peso sugerido", () => {
    const hint = pickSessionHint(
      exercise({ increase: 82.5 }, [set("a", 80, true), set("b", 80)]),
    );
    expect(hint).toEqual({ variant: "increase", weight: 82.5, canApply: true });
  });

  it("deja de ofrecerla una vez aceptada o con el ejercicio hecho", () => {
    expect(
      pickSessionHint(
        exercise({ increase: 82.5 }, [set("a", 80, true), set("b", 82.5)]),
      ),
    ).toBeNull();
    expect(
      pickSessionHint(
        exercise({ increase: 82.5 }, [set("a", 80, true), set("b", 80, true)]),
      ),
    ).toBeNull();
  });

  it("el anticipo solo informa", () => {
    expect(
      pickSessionHint(exercise({ preview: 82.5 }, [set("a", 80)])),
    ).toEqual({
      variant: "preview",
      weight: 82.5,
      canApply: false,
    });
  });

  it("ofrece la descarga mientras quede una serie pendiente más pesada", () => {
    expect(
      pickSessionHint(exercise({ deload: 50 }, [set("a", 80)]))?.variant,
    ).toBe("deload");
    expect(
      pickSessionHint(exercise({ deload: 50 }, [set("a", 50)])),
    ).toBeNull();
  });

  it("subir tiene prioridad sobre descargar", () => {
    expect(
      pickSessionHint(exercise({ increase: 82.5, deload: 50 }, [set("a", 80)]))
        ?.variant,
    ).toBe("increase");
  });

  it("tras cambiar de unidad en la sesión ya no ofrece la sugerencia, que está en la otra unidad", () => {
    const switched = { ...set("a", 36), unit: "lb" as const };
    expect(
      pickSessionHint(exercise({ increase: 82.5 }, [switched])),
    ).toBeNull();
  });

  it("sin sugerencias o sin peso no hay aviso", () => {
    expect(pickSessionHint(exercise({}, [set("a", 80)]))).toBeNull();
    expect(
      pickSessionHint(exercise({ increase: 82.5 }, [set("a", null)])),
    ).toBeNull();
  });
});

describe("repsAfterApply", () => {
  it("al subir con rango vuelve al mínimo; sin rango o al descargar no cambia las reps", () => {
    expect(repsAfterApply(exercise({}, [], 8), "increase")).toBe(8);
    expect(repsAfterApply(exercise({}, []), "increase")).toBeNull();
    expect(repsAfterApply(exercise({}, [], 8), "deload")).toBeNull();
  });
});
