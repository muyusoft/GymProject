import { describe, expect, it } from "vitest";
import { STRETCH_MOVEMENTS, WARMUP_MOVEMENTS } from "../data/movements";
import { illustrationFor } from "../utils/movement-illustration.utils";

describe("illustrationFor", () => {
  it("cada movimiento del catálogo tiene su ilustración", () => {
    for (const movement of [...WARMUP_MOVEMENTS, ...STRETCH_MOVEMENTS]) {
      expect(illustrationFor(movement.id), movement.id).toBe(movement.id);
    }
  });

  it("devuelve null con un id sin ilustración", () => {
    expect(illustrationFor("nope")).toBeNull();
  });
});
