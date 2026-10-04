import { describe, expect, it } from "vitest";
import { chunk } from "../chunk.utils";
import { normalizeText } from "../search.utils";

describe("normalizeText", () => {
  it("quita acentos y pasa a minúsculas", () => {
    expect(normalizeText("Extensión de Tríceps")).toBe("extension de triceps");
  });

  it("recorta espacios y acepta vacío", () => {
    expect(normalizeText("  Remo ")).toBe("remo");
    expect(normalizeText("")).toBe("");
  });
});

describe("chunk", () => {
  it("parte en tandas del tamaño pedido", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("devuelve una lista vacía para una entrada vacía", () => {
    expect(chunk([], 3)).toEqual([]);
  });
});
