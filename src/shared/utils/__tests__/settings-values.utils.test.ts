import { describe, expect, it } from "vitest";
import { parseSettings, serializeSetting } from "../settings-values.utils";

describe("parseSettings", () => {
  it("usa los valores por defecto cuando no hay nada guardado", () => {
    expect(parseSettings({}, "es")).toEqual({
      language: "es",
      weightUnit: "per_exercise",
      theme: "auto",
      progressionSuggestions: true,
      trackRpe: false,
      autoDeload: true,
      reminderEnabled: false,
      reminderHour: 18,
      reminderMinute: 0,
    });
  });

  it("lee lo guardado", () => {
    const settings = parseSettings(
      { language: "en", weightUnit: "kg", theme: "light", trackRpe: "true", autoDeload: "false" },
      "es",
    );
    expect(settings).toMatchObject({
      language: "en",
      weightUnit: "kg",
      theme: "light",
      trackRpe: true,
      autoDeload: false,
    });
  });

  it("lee el recordatorio guardado", () => {
    const settings = parseSettings({ reminderEnabled: "true", reminderHour: "7", reminderMinute: "45" }, "es");
    expect(settings).toMatchObject({ reminderEnabled: true, reminderHour: 7, reminderMinute: 45 });
  });

  it("ignora una hora o un minuto fuera de rango o con texto", () => {
    expect(parseSettings({ reminderHour: "24", reminderMinute: "60" }, "es")).toMatchObject({ reminderHour: 18, reminderMinute: 0 });
    expect(parseSettings({ reminderHour: "tarde", reminderMinute: "-5" }, "es")).toMatchObject({ reminderHour: 18, reminderMinute: 0 });
    expect(parseSettings({ reminderHour: "7.5" }, "es").reminderHour).toBe(18);
  });

  it("ignora valores corruptos en vez de fallar", () => {
    const settings = parseSettings({ language: "fr", weightUnit: "stone", theme: "pink" }, "en");
    expect(settings).toMatchObject({ language: "en", weightUnit: "per_exercise", theme: "auto" });
  });
});

describe("serializeSetting", () => {
  it("guarda booleanos y textos como texto", () => {
    expect(serializeSetting(true)).toBe("true");
    expect(serializeSetting("kg")).toBe("kg");
    expect(serializeSetting(45)).toBe("45");
  });
});
