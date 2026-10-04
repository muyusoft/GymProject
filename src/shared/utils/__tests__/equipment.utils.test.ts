import { describe, expect, it } from "vitest";
import { equipmentIncrementKey, weightStepFor } from "../equipment.utils";

const INCREMENTS = [
  { equipment: "dumbbell", unit: "lb", step: 2.5 },
  { equipment: "machine", unit: "lb", step: 5 },
] as const;

describe("equipmentIncrementKey", () => {
  it("asigna cada equipo a su salto de Ajustes", () => {
    expect(equipmentIncrementKey("dumbbell")).toBe("dumbbell");
    expect(equipmentIncrementKey("cable")).toBe("machine");
    expect(equipmentIncrementKey("barbell")).toBe("plates");
  });
});

describe("weightStepFor", () => {
  it("devuelve el salto configurado para el equipo y la unidad", () => {
    expect(weightStepFor({ increments: INCREMENTS, equipment: "machine", unit: "lb" })).toBe(5);
  });

  it("usa 2.5 cuando no hay salto configurado", () => {
    expect(weightStepFor({ increments: INCREMENTS, equipment: "barbell", unit: "kg" })).toBe(2.5);
  });
});
