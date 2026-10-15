import { describe, expect, it } from "vitest";
import type { SessionSet } from "../types/workout.types";
import { copyToFollowing } from "../utils/copy-sets.utils";

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

describe("copyToFollowing", () => {
  it("copia peso y reps a las series siguientes pendientes", () => {
    const sets = [set("a", { weight: 35, reps: 10 }), set("b"), set("c")];
    expect(copyToFollowing(sets, "a")).toEqual([
      { id: "b", patch: { weight: 35, reps: 10, seconds: null } },
      { id: "c", patch: { weight: 35, reps: 10, seconds: null } },
    ]);
  });

  it("no toca las anteriores ni las ya hechas", () => {
    const sets = [set("a"), set("b", { weight: 40 }), set("c", { completed: true }), set("d")];
    expect(copyToFollowing(sets, "b").map((copy) => copy.id)).toEqual(["d"]);
  });

  it("omite las que ya tienen los mismos valores", () => {
    expect(copyToFollowing([set("a"), set("b")], "a")).toEqual([]);
  });

  it("en un ejercicio por tiempo copia los segundos", () => {
    const sets = [
      set("a", { loadType: "time", reps: null, seconds: 60 }),
      set("b", { loadType: "time", reps: null, seconds: 45 }),
    ];
    expect(copyToFollowing(sets, "a")).toEqual([
      { id: "b", patch: { weight: 30, reps: null, seconds: 60 } },
    ]);
  });

  it("sin serie en edición o con la última no hay nada que copiar", () => {
    expect(copyToFollowing([set("a")], null)).toEqual([]);
    expect(copyToFollowing([set("a"), set("b", { weight: 40 })], "b")).toEqual([]);
  });
});
