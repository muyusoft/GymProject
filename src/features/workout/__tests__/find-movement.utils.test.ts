import { describe, expect, it } from "vitest";
import { findMovement } from "../utils/find-movement.utils";

describe("findMovement", () => {
  it("encuentra calentamientos y estiramientos por id", () => {
    expect(findMovement("bandLateralWalk")?.kind).toBe("warmup");
    expect(findMovement("standingQuad")?.kind).toBe("stretch");
  });

  it("devuelve null con un id desconocido o vacío", () => {
    expect(findMovement("nope")).toBeNull();
    expect(findMovement("")).toBeNull();
  });
});
