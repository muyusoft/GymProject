import { describe, expect, it } from "vitest";
import {
  bodyWeightId,
  catalogExerciseId,
  commonExerciseId,
  incrementId,
  swapId,
} from "../stable-id.utils";

describe("ids estables", () => {
  it("el ejercicio del catálogo se llama igual en cualquier instalación", () => {
    expect(catalogExerciseId("Barbell_Squat")).toBe("fedb:Barbell_Squat");
    expect(catalogExerciseId("Barbell_Squat")).toBe(
      catalogExerciseId("Barbell_Squat"),
    );
  });

  it("el ejercicio propio sale de su nombre, sin tildes, mayúsculas ni símbolos", () => {
    expect(commonExerciseId("Reverse pec deck")).toBe(
      "common:reverse-pec-deck",
    );
    expect(commonExerciseId("  Elevación lateral (polea) ")).toBe(
      "common:elevacion-lateral-polea",
    );
  });

  it("nombres distintos dan ids distintos", () => {
    expect(commonExerciseId("Jalón al pecho")).not.toBe(
      commonExerciseId("Jalón unilateral"),
    );
  });

  it("salto de peso, peso corporal y sustitución salen de su clave natural", () => {
    expect(incrementId("dumbbell", "lb")).toBe("dumbbell:lb");
    expect(bodyWeightId("2026-10-06")).toBe("2026-10-06");
    expect(swapId("2026-10-06", "plan-1")).toBe("2026-10-06:plan-1");
  });
});
