import { describe, expect, it } from "vitest";
import { parseDayHeader, resolveHeaderDate } from "../utils/day-header.utils";
import { parseDuration } from "../utils/duration.utils";
import { parseExerciseLine } from "../utils/line.utils";
import { detectLoadType } from "../utils/load-type.utils";
import { cleanLine, fixTypos, nameTokens, normalizeName, stemToken } from "../utils/normalize.utils";

describe("parseDuration", () => {
  it("lee minutos, segundos y ambos", () => {
    expect(parseDuration("1m30s")).toBe(90);
    expect(parseDuration("2m")).toBe(120);
    expect(parseDuration("45s")).toBe(45);
  });

  it("rechaza lo que no es una duración", () => {
    expect(parseDuration("12")).toBeNull();
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("m")).toBeNull();
  });
});

describe("parseDayHeader", () => {
  it("lee día de la semana, día y mes", () => {
    expect(parseDayHeader("Lunes 28 septiembre")).toEqual({ weekday: 0, day: 28, month: 8 });
    expect(parseDayHeader("Jueves 01 octubre")).toEqual({ weekday: 3, day: 1, month: 9 });
    expect(parseDayHeader("Miércoles 30 de septiembre:")).toEqual({ weekday: 2, day: 30, month: 8 });
  });

  it("acepta abreviaturas e inglés", () => {
    expect(parseDayHeader("Viernes 2 oct")).toEqual({ weekday: 4, day: 2, month: 9 });
    expect(parseDayHeader("Friday 2 October")).toEqual({ weekday: 4, day: 2, month: 9 });
  });

  it("no confunde un ejercicio con un encabezado", () => {
    expect(parseDayHeader("- Remo: 25kg 4 series de 10")).toBeNull();
    expect(parseDayHeader("Press banca 30 kg")).toBeNull();
    expect(parseDayHeader("Lunes 40 septiembre")).toBeNull();
  });
});

describe("resolveHeaderDate", () => {
  it("elige el año en que el día de la semana coincide", () => {
    const date = resolveHeaderDate({ weekday: 0, day: 28, month: 8 }, new Date(2026, 9, 2));
    expect(date.getFullYear()).toBe(2026);
  });

  it("toma el más cercano a hoy cuando coinciden varios años", () => {
    const date = resolveHeaderDate({ weekday: 0, day: 28, month: 8 }, new Date(2026, 0, 5));
    expect(date.getFullYear()).toBe(2026);
  });
});

describe("normalize", () => {
  it("quita viñeta y espacios dobles", () => {
    expect(cleanLine("-   Remo   con  barra ")).toBe("Remo con barra");
  });

  it("corrige erratas con límite de palabra", () => {
    expect(fixTypos("presa de hombros")).toBe("press de hombros");
    expect(fixTypos("Reverse peck deck")).toBe("Reverse pec deck");
    expect(fixTypos("Jalón el polea")).toBe("Jalón en polea");
    expect(fixTypos("prensa inclinada")).toBe("prensa inclinada");
  });

  it("pasa a singular y quita conectores y acentos", () => {
    expect(stemToken("elevaciones")).toBe("elevacion");
    expect(stemToken("mancuernas")).toBe("mancuerna");
    expect(nameTokens("Extensión de tríceps en polea")).toEqual(["extension", "tricep", "polea"]);
    expect(normalizeName("Aductores en máquina (hacia adentro)")).toBe("aductor maquina");
  });
});

describe("detectLoadType", () => {
  const base = { hasWeight: true, isTimed: false };

  it("distingue los modificadores de carga", () => {
    expect(detectLoadType({ ...base, modifiers: "en cada brazo" })).toBe("per_arm");
    expect(detectLoadType({ ...base, modifiers: "para cada brazo" })).toBe("per_arm");
    expect(detectLoadType({ ...base, modifiers: "por brazo" })).toBe("per_arm");
    expect(detectLoadType({ ...base, modifiers: "total en discos" })).toBe("plates");
    expect(detectLoadType({ ...base, modifiers: "en discos" })).toBe("plates");
    expect(detectLoadType({ ...base, modifiers: "total" })).toBe("total");
    expect(detectLoadType({ ...base, modifiers: "barra de" })).toBe("total");
  });

  it("sin modificador asume total, sin peso peso corporal y por tiempo tiempo", () => {
    expect(detectLoadType({ ...base, modifiers: "" })).toBe("total");
    expect(detectLoadType({ hasWeight: false, isTimed: false, modifiers: "" })).toBe("bodyweight");
    expect(detectLoadType({ hasWeight: true, isTimed: true, modifiers: "" })).toBe("time");
  });
});

describe("parseExerciseLine", () => {
  it("lee peso con espacio, coma decimal y unidad en mayúsculas", () => {
    expect(parseExerciseLine("- Pec deck: 50 kg 4 series de 12, descansos 1m30s", 1)).toMatchObject({ weight: 50, unit: "kg" });
    expect(parseExerciseLine("- Curl: 12,5 LB 3 series de 10", 1)).toMatchObject({ weight: 12.5, unit: "lb", restSec: null });
  });

  it("acepta una línea sin viñeta y con descanso sin 'de'", () => {
    expect(parseExerciseLine("Remo: 25kg 4 series de 10, descansos 2m", 7)).toMatchObject({
      lineNumber: 7,
      sets: 4,
      reps: 10,
      restSec: 120,
    });
  });

  it("devuelve null sin nombre o sin series", () => {
    expect(parseExerciseLine("- sin dos puntos 4 series de 10", 1)).toBeNull();
    expect(parseExerciseLine("- Remo: 25kg muchas veces", 1)).toBeNull();
    expect(parseExerciseLine(": 25kg 4 series de 10", 1)).toBeNull();
  });
});
