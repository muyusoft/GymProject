import { describe, expect, it } from "vitest";
import { generateId } from "../id.utils";

describe("generateId", () => {
  it("produce un UUID v4 con el formato canónico", () => {
    expect(generateId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("es determinista con el mismo generador aleatorio", () => {
    expect(generateId(() => 0)).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("no repite ids en una tanda grande", () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()));
    expect(ids.size).toBe(500);
  });
});
