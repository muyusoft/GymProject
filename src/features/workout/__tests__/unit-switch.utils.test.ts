import { describe, expect, it } from "vitest";
import type { SessionSet } from "../types/workout.types";
import { switchPendingSets } from "../utils/unit-switch.utils";

function set(id: string, patch: Partial<SessionSet> = {}): SessionSet {
  return {
    id,
    index: 0,
    weight: 30,
    unit: "lb",
    reps: 12,
    seconds: null,
    loadType: "per_arm",
    completed: false,
    isPR: false,
    rpe: null,
    ...patch,
  };
}

describe("switchPendingSets", () => {
  it("convierte las series pendientes y acerca el peso al salto del equipo", () => {
    const changes = switchPendingSets({
      sets: [set("a"), set("b", { weight: 35 })],
      unit: "kg",
      step: 0.5,
    });
    expect(changes).toEqual([
      { id: "a", unit: "kg", weight: 13.5 },
      { id: "b", unit: "kg", weight: 16 },
    ]);
  });

  it("no toca las series ya hechas", () => {
    const changes = switchPendingSets({
      sets: [set("a", { completed: true }), set("b")],
      unit: "kg",
      step: 2.5,
    });
    expect(changes.map((change) => change.id)).toEqual(["b"]);
  });

  it("las que ya están en esa unidad no cambian", () => {
    expect(
      switchPendingSets({
        sets: [set("a", { unit: "kg" })],
        unit: "kg",
        step: 2.5,
      }),
    ).toEqual([]);
  });

  it("una serie sin peso solo cambia de unidad", () => {
    expect(
      switchPendingSets({
        sets: [set("a", { weight: null })],
        unit: "kg",
        step: 2.5,
      }),
    ).toEqual([{ id: "a", unit: "kg", weight: null }]);
  });

  it("de kg a lb usa el salto en libras", () => {
    const [change] = switchPendingSets({
      sets: [set("a", { weight: 20, unit: "kg" })],
      unit: "lb",
      step: 5,
    });
    expect(change).toEqual({ id: "a", unit: "lb", weight: 45 });
  });
});
