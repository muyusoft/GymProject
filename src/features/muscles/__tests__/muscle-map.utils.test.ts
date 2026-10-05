import { describe, expect, it } from "vitest";
import { getSemanticColors } from "@/design/tokens";
import type { MuscleLink } from "../types/muscles.types";
import { joinGroupNames } from "../utils/group-labels.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import {
  buildConsistencyMonth,
  computeStreak,
  firstConsistencyMonth,
  isCurrentMonth,
  nextPendingDay,
} from "../utils/consistency.utils";
import {
  exercisePaint,
  shortCitation,
  summarizeLinks,
  toMuscleLink,
  uniqueSourceIds,
} from "../utils/exercise-muscles.utils";
import {
  balanceInsight,
  emptyGroupSets,
  rankGroups,
  volumeTier,
  weeklySetsByGroup,
} from "../utils/muscle-volume.utils";

function link(overrides: Partial<MuscleLink>): MuscleLink {
  return { exerciseId: "bench", group: "chest", view: "both", role: "primary", basis: "measured", sourceIds: [], ...overrides };
}

describe("weeklySetsByGroup", () => {
  const links = [
    link({}),
    link({ group: "triceps", role: "secondary" }),
    link({ exerciseId: "row", group: "upper-back" }),
  ];

  it("suma 1 por serie al grupo principal y 0.5 al secundario", () => {
    const totals = weeklySetsByGroup([{ exerciseId: "bench" }, { exerciseId: "bench" }, { exerciseId: "bench" }], links);
    expect(totals.chest).toBe(3);
    expect(totals.triceps).toBe(1.5);
    expect(totals["upper-back"]).toBe(0);
  });

  it("suma las series de distintos ejercicios sobre el mismo grupo", () => {
    const totals = weeklySetsByGroup([{ exerciseId: "bench" }, { exerciseId: "row" }, { exerciseId: "row" }], links);
    expect(totals).toMatchObject({ chest: 1, "upper-back": 2, triceps: 0.5 });
  });

  it("si un ejercicio liga dos veces el mismo grupo cuenta la de mayor peso, no las dos", () => {
    const twice = [link({ role: "secondary" }), link({ role: "primary" })];
    expect(weeklySetsByGroup([{ exerciseId: "bench" }], twice).chest).toBe(1);
  });

  it("ignora los ejercicios sin músculos mapeados", () => {
    expect(weeklySetsByGroup([{ exerciseId: "unknown" }], links)).toEqual(emptyGroupSets());
  });
});

describe("balance y niveles", () => {
  const totals = {
    ...emptyGroupSets(),
    deltoids: 24,
    quadriceps: 20,
    chest: 16,
    "upper-back": 16,
    triceps: 16,
    hamstring: 16,
    abs: 15,
    biceps: 12,
    gluteal: 8,
    calves: 8,
  };

  it("ordena de más a menos series", () => {
    expect(rankGroups(totals).slice(0, 2).map((item) => item.group)).toEqual(["deltoids", "quadriceps"]);
  });

  it("avisa cuando el grupo con más series triplica a los dos más rezagados", () => {
    expect(balanceInsight(totals)).toEqual({ top: "deltoids", low: ["gluteal", "calves"], ratio: 3 });
  });

  it("no avisa si el reparto es parejo o hay muy pocos grupos", () => {
    expect(balanceInsight({ ...emptyGroupSets(), chest: 10, abs: 9, calves: 10 })).toBeNull();
    expect(balanceInsight({ ...emptyGroupSets(), chest: 10, abs: 2 })).toBeNull();
  });

  it("clasifica en alto, medio y bajo respecto al máximo", () => {
    expect(volumeTier(24, 24)).toBe("high");
    expect(volumeTier(16, 24)).toBe("mid");
    expect(volumeTier(8, 24)).toBe("low");
    expect(volumeTier(0, 0)).toBe("low");
  });
});

describe("músculos por ejercicio", () => {
  const colors = getSemanticColors("dark");

  it("pinta principal y secundario con su color y respeta la vista", () => {
    const paint = exercisePaint(
      [link({ group: "upper-back", view: "back" }), link({ group: "deltoids", role: "secondary", view: "back" }), link({ group: "biceps", role: "secondary", view: "front" })],
      colors,
    );
    expect(paint["upper-back"]).toEqual({ color: colors.musclePrimary, view: "back" });
    expect(paint.deltoids).toEqual({ color: colors.muscleSecondary, view: "back" });
    expect(paint.biceps?.view).toBe("front");
  });

  it("un ejercicio sin datos no pinta nada", () => {
    expect(exercisePaint([], colors)).toEqual({});
  });

  it("separa principales de secundarios", () => {
    const summary = summarizeLinks([link({}), link({ group: "triceps", role: "secondary" })]);
    expect(summary.primary.map((item) => item.group)).toEqual(["chest"]);
    expect(summary.secondary.map((item) => item.group)).toEqual(["triceps"]);
  });

  it("acorta la cita y junta las fuentes sin repetir", () => {
    expect(shortCitation("Buonsenso et al. 2025, Lat pulldown EMG, Journal")).toBe("Buonsenso et al. 2025");
    expect(shortCitation("Sin año")).toBe("Sin año");
    expect(uniqueSourceIds([link({ sourceIds: ["a", "b"] }), link({ sourceIds: ["b", "c"] })])).toEqual(["a", "b", "c"]);
  });

  it("convierte la fila de la base de datos y trata un JSON dañado como sin fuentes", () => {
    const row = { exerciseId: "e", muscleGroup: "chest" as const, view: "both" as const, role: "primary" as const, basis: "measured" as const };
    expect(toMuscleLink({ ...row, sourceIds: '["a","b"]' }).sourceIds).toEqual(["a", "b"]);
    expect(toMuscleLink({ ...row, sourceIds: "{roto" }).sourceIds).toEqual([]);
    expect(toMuscleLink({ ...row, sourceIds: '{"a":1}' }).sourceIds).toEqual([]);
  });
});

describe("constancia", () => {
  const today = new Date(2026, 9, 2);
  const planned = [0, 1, 2, 3, 4];
  const thisWeek = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01"];
  const lastWeek = ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25"];
  const options = { sessionDates: [...thisWeek, ...lastWeek], plannedWeekdays: planned, today };

  it("arma el mes de lunes a domingo, con huecos para los días de otros meses", () => {
    const { rows } = buildConsistencyMonth({ ...options, month: new Date(2026, 9, 1) });
    expect(rows).toHaveLength(5);
    expect(rows[0]?.map((day) => day?.dayOfMonth ?? null)).toEqual([null, null, null, 1, 2, 3, 4]);
  });

  it("marca los días hechos, el pendiente de esta semana y los demás sin entreno", () => {
    const october = buildConsistencyMonth({ ...options, month: new Date(2026, 9, 1) });
    expect(october.rows[0]?.map((day) => day?.state ?? null)).toEqual([null, null, null, "done", "pending", "none", "none"]);
    expect(october.rows[0]?.[4]).toEqual({ date: "2026-10-02", dayOfMonth: 2, state: "pending", isToday: true });
    expect(october.doneCount).toBe(1);
  });

  it("en un mes pasado no hay pendientes: solo hecho o sin entreno", () => {
    const september = buildConsistencyMonth({ ...options, month: new Date(2026, 8, 15) });
    const states = september.rows.flat().flatMap((day) => (day ? [day.state] : []));
    expect(states.filter((state) => state === "done")).toHaveLength(8);
    expect(states).not.toContain("pending");
    expect(september.doneCount).toBe(8);
  });

  it("un entreno planeado de esta semana que ya pasó sin hacerse queda sin entreno, no pendiente", () => {
    const missed = buildConsistencyMonth({ ...options, sessionDates: lastWeek, month: new Date(2026, 9, 1) });
    expect(missed.rows[0]?.[3]?.state).toBe("none");
    expect(missed.rows[0]?.[4]?.state).toBe("pending");
  });

  it("dos sesiones el mismo día cuentan una sola vez", () => {
    const month = buildConsistencyMonth({ ...options, sessionDates: ["2026-10-01", "2026-10-01"], month: new Date(2026, 9, 1) });
    expect(month.doneCount).toBe(1);
  });

  it("se puede retroceder hasta el mes de la primera sesión", () => {
    expect(toIsoDate(firstConsistencyMonth(options.sessionDates, today))).toBe("2026-09-01");
    expect(toIsoDate(firstConsistencyMonth([], today))).toBe("2026-10-01");
    expect(toIsoDate(firstConsistencyMonth(["2027-01-05"], today))).toBe("2026-10-01");
    expect(isCurrentMonth(new Date(2026, 9, 20), today)).toBe(true);
    expect(isCurrentMonth(new Date(2026, 8, 20), today)).toBe(false);
  });

  it("la racha cuenta los entrenos planeados seguidos y hoy sin hacer todavía no la corta", () => {
    expect(computeStreak(options)).toBe(9);
    expect(computeStreak({ ...options, sessionDates: [...options.sessionDates, "2026-10-02"] })).toBe(10);
  });

  it("la racha se corta al saltarse un entreno planeado", () => {
    expect(computeStreak({ ...options, sessionDates: thisWeek.filter((date) => date !== "2026-09-30") })).toBe(1);
    expect(computeStreak({ ...options, plannedWeekdays: [] })).toBe(0);
  });

  it("dice qué entreno falta: hoy si toca, o el próximo de la semana", () => {
    expect(nextPendingDay(options)).toEqual({ weekday: 4, isToday: true });
    expect(nextPendingDay({ ...options, sessionDates: [...options.sessionDates, "2026-10-02"] })).toBeNull();
    const wednesday = { ...options, today: new Date(2026, 8, 30), sessionDates: ["2026-09-28", "2026-09-29", "2026-09-30"] };
    expect(nextPendingDay(wednesday)).toEqual({ weekday: 3, isToday: false });
  });
});

describe("joinGroupNames", () => {
  const t = (key: string) => ({ "muscles.group.chest": "Pecho", "muscles.group.upper-back": "Espalda alta" })[key] ?? key;

  it("une los nombres en una frase con la primera en mayúscula", () => {
    expect(joinGroupNames(["chest", "upper-back"], t)).toBe("Pecho, espalda alta");
    expect(joinGroupNames([], t)).toBe("");
  });
});
