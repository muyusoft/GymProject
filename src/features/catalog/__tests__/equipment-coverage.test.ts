import { describe, expect, it } from "vitest";
import { GYM_EQUIPMENT, type GymEquipment } from "@/shared/types/equipment.types";
import { canPerform, parseRequirements } from "@/shared/utils/equipment-requirements.utils";
import commonExercises from "../data/common-exercises.json";

/** Los patrones que sostienen cualquier plan: si alguno queda sin ejercicio, el día queda cojo. */
const CORE_PATTERNS = ["horizontal_push", "horizontal_pull", "vertical_pull", "squat", "lunge", "hinge_rdl", "hip_thrust", "core"];

const SETUPS: Record<string, readonly GymEquipment[]> = {
  "solo mancuernas": ["dumbbells"],
  "mancuernas y banco": ["dumbbells", "adjustableBench"],
  "gimnasio de edificio": ["dumbbells", "adjustableBench", "pullUpBar", "bands", "cableTower", "latPulldown"],
  "gimnasio completo": GYM_EQUIPMENT,
};

function coveredPatterns(available: ReadonlySet<GymEquipment>): Set<string> {
  return new Set(
    commonExercises.exercises
      .filter((exercise) => canPerform(parseRequirements(JSON.stringify(exercise.requires ?? null)), available))
      .map((exercise) => exercise.pattern),
  );
}

describe("cobertura del catálogo por equipo", () => {
  it("cada ejercicio común tiene requisitos válidos o declara que no tiene dato", () => {
    for (const exercise of commonExercises.exercises) {
      const requires = exercise.requires ?? null;
      if (requires === null) continue;
      expect(parseRequirements(JSON.stringify(requires)), exercise.nameEs).not.toBeNull();
    }
  });

  for (const [name, equipment] of Object.entries(SETUPS)) {
    it(`con ${name} hay ejercicio para cada patrón principal`, () => {
      const covered = coveredPatterns(new Set(equipment));
      const missing = CORE_PATTERNS.filter((pattern) => !covered.has(pattern));
      // Solo mancuernas no tiene tirón vertical sin banco: el generador lo cubre con otro tirón.
      const allowed = name === "solo mancuernas" ? ["vertical_pull"] : [];
      expect(missing).toEqual(allowed);
    });
  }

  it("sin equipo hay al menos empuje, sentadilla, puente y core", () => {
    const covered = coveredPatterns(new Set());
    for (const pattern of ["horizontal_push", "squat", "hip_thrust", "core"]) expect(covered.has(pattern)).toBe(true);
  });
});
