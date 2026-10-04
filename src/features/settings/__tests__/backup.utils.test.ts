import { describe, expect, it } from "vitest";
import { BackupError, type BackupData, type BackupExercise } from "../types/backup.types";
import {
  backupFileName,
  buildBackup,
  parseBackup,
  pickUserSettings,
  resolveExercises,
  summarizeBackup,
} from "../utils/backup.utils";

const EXERCISE: BackupExercise = {
  id: "ex-1",
  sourceId: "Barbell_Row",
  nameEs: "Remo con barra",
  nameEn: "Barbell Row",
  pattern: "horizontal_pull",
  equipment: "barbell",
  defaultLoadType: "total",
};

function data(overrides: Partial<BackupData> = {}): BackupData {
  return {
    settings: { language: "es", weightUnit: "kg", reminderEnabled: "true" },
    equipmentIncrements: [{ id: "inc-1", equipment: "dumbbell", unit: "lb", step: 2.5, updatedAt: 1 }],
    exercises: [EXERCISE],
    plans: [{ id: "plan-1", name: "Mi plan", repeatsWeekly: true, updatedAt: 1 }],
    planDays: [{ id: "day-1", planId: "plan-1", weekday: 0, name: "Lunes", order: 0, defaultSets: 4, defaultReps: 12, defaultRestSec: 90, updatedAt: 1 }],
    planExercises: [
      {
        id: "pe-1",
        planDayId: "day-1",
        exerciseId: "ex-1",
        order: 0,
        sets: 4,
        reps: 12,
        seconds: null,
        restSec: 90,
        targetWeight: 30.5,
        unit: "lb",
        loadType: "per_arm",
        progressionRule: '{"enabled":true,"sessions":2}',
        updatedAt: 1,
      },
    ],
    sessions: [{ id: "s-1", planDayId: "day-1", date: "2026-09-28", startedAt: 100, endedAt: 200, origin: "import", updatedAt: 1 }],
    setLogs: [
      {
        id: "log-1",
        sessionId: "s-1",
        exerciseId: "ex-1",
        setIndex: 0,
        weight: 30.5,
        unit: "lb",
        loadType: "per_arm",
        reps: 12,
        seconds: null,
        rpe: null,
        completed: true,
        isPR: false,
        updatedAt: 1,
      },
    ],
    ...overrides,
  };
}

const NOW = new Date(2026, 9, 2, 20, 15);
const serialize = (value: BackupData) => JSON.stringify(buildBackup(value, NOW));

describe("exportar y volver a importar", () => {
  it("deja exactamente los mismos datos", () => {
    const original = data();
    expect(parseBackup(serialize(original)).data).toEqual(original);
  });

  it("conserva decimales, nulos y booleanos", () => {
    const restored = parseBackup(serialize(data())).data;
    expect(restored.setLogs[0]).toMatchObject({ weight: 30.5, seconds: null, completed: true, isPR: false });
  });

  it("marca el archivo con la app, la versión y la fecha", () => {
    const file = buildBackup(data(), NOW);
    expect(file).toMatchObject({ app: "overload", version: 1 });
    expect(new Date(file.exportedAt).getTime()).toBe(NOW.getTime());
  });

  it("resume lo que contiene", () => {
    expect(summarizeBackup(buildBackup(data(), NOW))).toEqual({ plans: 1, days: 1, exercises: 1, sessions: 1, sets: 1 });
  });
});

describe("parseBackup rechaza archivos que no sirven", () => {
  const code = (raw: string) => {
    try {
      parseBackup(raw);
      return null;
    } catch (error) {
      return error instanceof BackupError ? error.code : "other";
    }
  };

  it("texto que no es JSON", () => {
    expect(code("esto no es json")).toBe("not_json");
    expect(code("")).toBe("not_json");
  });

  it("JSON que no es de Overload", () => {
    expect(code("[]")).toBe("wrong_app");
    expect(code("null")).toBe("wrong_app");
    expect(code(JSON.stringify({ app: "otra", version: 1 }))).toBe("wrong_app");
  });

  it("versión que esta app no conoce", () => {
    expect(code(JSON.stringify({ app: "overload", version: 99, exportedAt: "x", data: data() }))).toBe("unsupported_version");
  });

  it("tablas que faltan o con tipos equivocados", () => {
    const base = { app: "overload", version: 1, exportedAt: "2026-10-02T00:00:00Z" };
    const { sessions: _omitted, ...withoutSessions } = data();
    expect(code(JSON.stringify({ ...base, data: withoutSessions }))).toBe("invalid_data");
    const badWeight = data({ setLogs: [{ ...data().setLogs[0]!, weight: "pesado" as unknown as number }] });
    expect(code(JSON.stringify({ ...base, data: badWeight }))).toBe("invalid_data");
    const badUnit = data({ planExercises: [{ ...data().planExercises[0]!, unit: "stone" as "lb" }] });
    expect(code(JSON.stringify({ ...base, data: badUnit }))).toBe("invalid_data");
  });

  it("referencias a filas que no están en el archivo", () => {
    const base = { app: "overload", version: 1, exportedAt: "2026-10-02T00:00:00Z" };
    const orphanLog = data({ setLogs: [{ ...data().setLogs[0]!, sessionId: "no-existe" }] });
    expect(code(JSON.stringify({ ...base, data: orphanLog }))).toBe("invalid_data");
    const orphanDay = data({ planExercises: [{ ...data().planExercises[0]!, planDayId: "no-existe" }] });
    expect(code(JSON.stringify({ ...base, data: orphanDay }))).toBe("invalid_data");
    const orphanExercise = data({ exercises: [] });
    expect(code(JSON.stringify({ ...base, data: orphanExercise }))).toBe("invalid_data");
  });
});

describe("resolveExercises", () => {
  let counter = 0;
  const createId = () => `new-${++counter}`;

  it("vincula por el id del catálogo aunque cambie el id local", () => {
    const { idMap, toCreate } = resolveExercises([EXERCISE], [{ id: "local-9", sourceId: "Barbell_Row", nameEs: "Otro", nameEn: "Otro" }], createId);
    expect(idMap.get("ex-1")).toBe("local-9");
    expect(toCreate).toEqual([]);
  });

  it("sin id de catálogo vincula por nombre, sin importar acentos ni mayúsculas", () => {
    const custom = { ...EXERCISE, sourceId: null, nameEs: "Prensa Inclinada", nameEn: "Prensa Inclinada" };
    const known = [{ id: "local-2", sourceId: null, nameEs: "prensa inclinada", nameEn: "PRENSA INCLINADA" }];
    expect(resolveExercises([custom], known, createId).idMap.get("ex-1")).toBe("local-2");
  });

  it("crea los que no existen y conserva su id si está libre", () => {
    const { idMap, toCreate } = resolveExercises([EXERCISE], [], createId);
    expect(toCreate.map((item) => item.id)).toEqual(["ex-1"]);
    expect(idMap.get("ex-1")).toBe("ex-1");
  });

  it("le da un id nuevo si el suyo ya lo usa otro ejercicio", () => {
    const known = [{ id: "ex-1", sourceId: "Otro", nameEs: "Otro", nameEn: "Other" }];
    const { idMap, toCreate } = resolveExercises([EXERCISE], known, createId);
    expect(toCreate[0]?.id).toMatch(/^new-/);
    expect(idMap.get("ex-1")).toBe(toCreate[0]?.id);
  });

  it("dos ejercicios del respaldo con el mismo nombre se crean una sola vez", () => {
    const twin = { ...EXERCISE, id: "ex-2", sourceId: null };
    const first = { ...EXERCISE, sourceId: null };
    const { idMap, toCreate } = resolveExercises([first, twin], [], createId);
    expect(toCreate).toHaveLength(1);
    expect(idMap.get("ex-2")).toBe(idMap.get("ex-1"));
  });
});

describe("pickUserSettings y backupFileName", () => {
  it("no respalda la marca del seed", () => {
    expect(pickUserSettings({ seeded: "1", language: "es" })).toEqual({ language: "es" });
  });

  it("nombra el archivo con la fecha", () => {
    expect(backupFileName(new Date(2026, 9, 2))).toBe("overload-backup-2026-10-02.json");
    expect(backupFileName(new Date(2026, 0, 5))).toBe("overload-backup-2026-01-05.json");
  });
});
