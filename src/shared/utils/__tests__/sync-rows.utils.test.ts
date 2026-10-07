import { describe, expect, it } from "vitest";
import {
  decideRemoteChange,
  groupDeletions,
  latestSyncedAt,
  toLocalRow,
  toRemoteRow,
  withOverlap,
} from "../sync-rows.utils";

const SET_LOGS = {
  columns: ["session_id", "weight", "completed", "is_pr"],
  booleans: ["completed", "is_pr"],
};

describe("toRemoteRow", () => {
  it("copia solo las columnas acordadas, convierte 0/1 en booleanos y sube sin marca de borrado", () => {
    const local = {
      id: "a",
      session_id: "s",
      weight: 80,
      completed: 1,
      is_pr: 0,
      updated_at: 10,
      set_index: 2,
    };
    expect(toRemoteRow(SET_LOGS, local)).toEqual({
      id: "a",
      session_id: "s",
      weight: 80,
      completed: true,
      is_pr: false,
      updated_at: 10,
      deleted_at: null,
    });
  });

  it("un valor ausente sube como null", () => {
    expect(toRemoteRow(SET_LOGS, { id: "a", updated_at: 1 })).toMatchObject({
      weight: null,
      completed: null,
    });
  });
});

describe("toLocalRow", () => {
  it("deja fuera las columnas del servidor y guarda los booleanos como 0/1", () => {
    const remote = {
      id: "a",
      user_id: "u",
      session_id: "s",
      weight: 80,
      completed: true,
      is_pr: false,
      updated_at: 10,
      deleted_at: null,
      synced_at: "2026-10-06T12:00:00+00:00",
    };
    expect(toLocalRow(SET_LOGS, remote)).toEqual({
      id: "a",
      session_id: "s",
      weight: 80,
      completed: 1,
      is_pr: 0,
      updated_at: 10,
    });
  });
});

describe("decideRemoteChange", () => {
  it("una fila que el teléfono no tiene se crea", () => {
    expect(decideRemoteChange(null, { updated_at: 10, deleted_at: null })).toBe(
      "upsert",
    );
  });

  it("gana la modificación más reciente", () => {
    expect(decideRemoteChange(5, { updated_at: 10, deleted_at: null })).toBe(
      "upsert",
    );
    expect(decideRemoteChange(20, { updated_at: 10, deleted_at: null })).toBe(
      "skip",
    );
  });

  it("el eco de lo recién subido no se vuelve a aplicar", () => {
    expect(decideRemoteChange(10, { updated_at: 10, deleted_at: null })).toBe(
      "skip",
    );
  });

  it("un borrado más nuevo borra la fila local; uno más viejo que la edición local no", () => {
    expect(decideRemoteChange(5, { updated_at: 10, deleted_at: 10 })).toBe(
      "delete",
    );
    expect(decideRemoteChange(20, { updated_at: 10, deleted_at: 10 })).toBe(
      "skip",
    );
  });

  it("un borrado de algo que el teléfono no tiene no hace nada", () => {
    expect(decideRemoteChange(null, { updated_at: 10, deleted_at: 10 })).toBe(
      "skip",
    );
  });
});

describe("latestSyncedAt", () => {
  it("se queda con la hora más reciente entre el cursor y las filas", () => {
    const rows = [
      { synced_at: "2026-10-06T12:00:01+00:00" },
      { synced_at: "2026-10-06T12:00:05+00:00" },
    ];
    expect(latestSyncedAt("2026-10-06T12:00:03+00:00", rows)).toBe(
      "2026-10-06T12:00:05+00:00",
    );
    expect(latestSyncedAt("2026-10-06T13:00:00+00:00", rows)).toBe(
      "2026-10-06T13:00:00+00:00",
    );
  });

  it("sin filas conserva el cursor, y sin cursor ni filas es null", () => {
    expect(latestSyncedAt("2026-10-06T12:00:00+00:00", [])).toBe(
      "2026-10-06T12:00:00+00:00",
    );
    expect(latestSyncedAt(null, [])).toBeNull();
  });
});

describe("withOverlap", () => {
  it("sin cursor pide todo desde el principio", () => {
    expect(withOverlap(null, 10_000)).toBe("1970-01-01T00:00:00.000Z");
  });

  it("retrocede el margen pedido", () => {
    expect(withOverlap("2026-10-06T12:00:10.000Z", 10_000)).toBe(
      "2026-10-06T12:00:00.000Z",
    );
  });

  it("un cursor ilegible vuelve al principio", () => {
    expect(withOverlap("no es una fecha", 10_000)).toBe(
      "1970-01-01T00:00:00.000Z",
    );
  });
});

describe("groupDeletions", () => {
  it("agrupa por tabla con la hora del borrado más reciente", () => {
    const groups = groupDeletions([
      { tableName: "plan_days", rowId: "a", deletedAt: 5 },
      { tableName: "plan_days", rowId: "b", deletedAt: 9 },
      { tableName: "set_logs", rowId: "c", deletedAt: 7 },
    ]);
    expect(groups.get("plan_days")).toEqual({ ids: ["a", "b"], deletedAt: 9 });
    expect(groups.get("set_logs")).toEqual({ ids: ["c"], deletedAt: 7 });
  });

  it("sin borrados no hay grupos", () => {
    expect(groupDeletions([]).size).toBe(0);
  });
});
