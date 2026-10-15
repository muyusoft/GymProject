import { describe, expect, it } from "vitest";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import { STRETCH_MOVEMENTS, WARMUP_MOVEMENTS } from "../data/movements";
import { MOVEMENT_SOURCES } from "../types/warmup.types";

type Texts = Record<string, Record<string, string> | undefined>;
const LOCALES = { es: es.movement as unknown as Texts, en: en.movement as unknown as Texts };

describe("textos de las fichas de movimiento", () => {
  it.each(Object.entries(LOCALES))("en %s cada movimiento tiene nombre, para qué sirve, consejo y todos sus pasos", (_, texts) => {
    for (const movement of [...WARMUP_MOVEMENTS, ...STRETCH_MOVEMENTS]) {
      const entry = texts[movement.id];
      const steps = Array.from({ length: movement.stepCount }, (__, index) => `step${index + 1}`);
      for (const key of ["name", "purpose", "tip", ...steps]) {
        expect(entry?.[key], `${movement.id}.${key}`).toBeTruthy();
      }
    }
  });

  it.each(Object.entries(LOCALES))("en %s cada fuente tiene su nombre", (_, texts) => {
    for (const source of MOVEMENT_SOURCES) expect(texts.source?.[source]).toBeTruthy();
  });
});
