import { describe, expect, it } from "vitest";
import { buildBodyParts } from "../body-map.utils";

const names = (parts: { slug: string }[]) => parts.map((part) => part.slug).sort();

describe("buildBodyParts", () => {
  it("pinta el deltoides anterior solo de frente y el posterior solo en la espalda", () => {
    const front = { deltoids: { color: "#a", view: "front" as const } };
    const back = { deltoids: { color: "#b", view: "back" as const } };
    expect(names(buildBodyParts(front, "front"))).toEqual(["deltoids"]);
    expect(names(buildBodyParts(front, "back"))).toEqual([]);
    expect(names(buildBodyParts(back, "back"))).toEqual(["deltoids"]);
    expect(names(buildBodyParts(back, "front"))).toEqual([]);
  });

  it("pinta en las dos vistas con 'both' o sin vista", () => {
    const groups = { triceps: { color: "#a", view: "both" as const }, chest: { color: "#b" } };
    expect(names(buildBodyParts(groups, "front"))).toEqual(["chest", "triceps"]);
    expect(names(buildBodyParts(groups, "back"))).toEqual(["chest", "triceps"]);
  });

  it("conserva el color de cada grupo", () => {
    expect(buildBodyParts({ abs: { color: "#123" } }, "front")).toEqual([{ slug: "abs", color: "#123" }]);
  });

  it("no pinta nada sin grupos: un ejercicio sin dato deja la figura en gris", () => {
    expect(buildBodyParts({}, "front")).toEqual([]);
  });
});
