import { describe, expect, it } from "vitest";
import { GYM_EQUIPMENT } from "@/shared/types/equipment.types";
import { EQUIPMENT_BY_GROUP, EQUIPMENT_GROUPS } from "../types/equipment-groups";

describe("EQUIPMENT_BY_GROUP", () => {
  it("muestra cada equipo una sola vez, sin dejar ninguno fuera", () => {
    const shown = EQUIPMENT_GROUPS.flatMap((group) => EQUIPMENT_BY_GROUP[group]);
    expect([...shown].sort()).toEqual([...GYM_EQUIPMENT].sort());
  });
});
