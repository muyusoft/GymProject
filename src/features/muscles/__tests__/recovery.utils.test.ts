import { describe, expect, it } from "vitest";
import type { MuscleLink, RecoverySet } from "../types/muscles.types";
import { computeRecovery, recoveryState } from "../utils/recovery.utils";
import {
  groupByPercent,
  groupByState,
  latestWorkedAt,
  recoveryPaint,
  relativeDay,
  todayInsight,
} from "../utils/recovery-view.utils";
import { getSemanticColors } from "@/design/tokens";

const HOUR = 3_600_000;
const NOW = new Date(2026, 9, 2, 12).getTime();

function link(overrides: Partial<MuscleLink>): MuscleLink {
  return {
    exerciseId: "bench",
    group: "chest",
    view: "both",
    role: "primary",
    basis: "measured",
    sourceIds: ["s"],
    ...overrides,
  };
}

function set(
  hoursAgo: number,
  overrides: Partial<RecoverySet> = {},
): RecoverySet {
  return {
    sessionId: `session-${hoursAgo}`,
    exerciseId: "bench",
    nameEs: "Press de banca",
    nameEn: "Bench press",
    endedAt: NOW - hoursAgo * HOUR,
    rpe: null,
    ...overrides,
  };
}

const LINKS = [
  link({}),
  link({ group: "triceps", role: "secondary" }),
  link({ group: "deltoids", role: "secondary", view: "front" }),
];

const of = (recoveries: ReturnType<typeof computeRecovery>, group: string) =>
  recoveries.find((item) => item.group === group);

describe("recoveryState", () => {
  it("menos de 50% es recién trabajado, de 50 a 99% recuperando y 100% listo", () => {
    expect(recoveryState(0)).toBe("worked");
    expect(recoveryState(0.49)).toBe("worked");
    expect(recoveryState(0.5)).toBe("recovering");
    expect(recoveryState(0.99)).toBe("recovering");
    expect(recoveryState(1)).toBe("ready");
  });
});

describe("computeRecovery", () => {
  it("un grupo principal necesita 48 h: a las 24 h va al 50%", () => {
    const chest = of(
      computeRecovery({ sets: [set(24)], links: LINKS, now: NOW }),
      "chest",
    );
    expect(chest).toMatchObject({ state: "recovering", role: "primary" });
    expect(chest?.percent).toBeCloseTo(0.5);
  });

  it("un grupo secundario necesita 24 h: a las 12 h va al 50% y a las 30 h está listo", () => {
    expect(
      of(
        computeRecovery({ sets: [set(12)], links: LINKS, now: NOW }),
        "triceps",
      )?.percent,
    ).toBeCloseTo(0.5);
    expect(
      of(
        computeRecovery({ sets: [set(30)], links: LINKS, now: NOW }),
        "triceps",
      ),
    ).toMatchObject({ state: "ready", percent: 1 });
  });

  it("recién entrenado queda como recién trabajado", () => {
    expect(
      of(computeRecovery({ sets: [set(10)], links: LINKS, now: NOW }), "chest"),
    ).toMatchObject({ state: "worked" });
  });

  it("una serie con RPE 9 o más suma 24 h: a las 50 h todavía está recuperando", () => {
    const plain = of(
      computeRecovery({ sets: [set(50)], links: LINKS, now: NOW }),
      "chest",
    );
    const hard = of(
      computeRecovery({ sets: [set(50, { rpe: 9 })], links: LINKS, now: NOW }),
      "chest",
    );
    expect(plain?.state).toBe("ready");
    expect(hard?.state).toBe("recovering");
    expect(hard?.percent).toBeCloseTo(50 / 72);
  });

  it("con varias sesiones cuenta la más exigente pendiente", () => {
    const chest = of(
      computeRecovery({ sets: [set(60), set(10)], links: LINKS, now: NOW }),
      "chest",
    );
    expect(chest?.state).toBe("worked");
    expect(chest?.percent).toBeCloseTo(10 / 48);
  });

  it("si en una sesión el grupo fue principal en un ejercicio y secundario en otro, cuenta como principal", () => {
    const links = [
      ...LINKS,
      link({ exerciseId: "dip", group: "triceps", role: "primary" }),
    ];
    const sets = [
      set(12, { sessionId: "same" }),
      set(12, { sessionId: "same", exerciseId: "dip", nameEs: "Fondos" }),
    ];
    const triceps = of(computeRecovery({ sets, links, now: NOW }), "triceps");
    expect(triceps).toMatchObject({
      role: "primary",
      cause: { exerciseId: "dip" },
    });
    expect(triceps?.percent).toBeCloseTo(12 / 48);
  });

  it("un grupo sin sesiones recientes está listo y sin registro", () => {
    expect(
      of(computeRecovery({ sets: [], links: LINKS, now: NOW }), "calves"),
    ).toEqual({
      group: "calves",
      state: "ready",
      percent: 1,
      role: null,
      lastWorkedAt: null,
      cause: null,
    });
  });

  it("un grupo ya recuperado conserva cuándo se trabajó por última vez", () => {
    const chest = of(
      computeRecovery({ sets: [set(60), set(70)], links: LINKS, now: NOW }),
      "chest",
    );
    expect(chest).toMatchObject({
      state: "ready",
      lastWorkedAt: NOW - 60 * HOUR,
    });
  });

  it("devuelve los 15 grupos de la figura", () => {
    expect(computeRecovery({ sets: [], links: [], now: NOW })).toHaveLength(15);
  });
});

describe("vistas de la recuperación", () => {
  const recoveries = computeRecovery({
    sets: [
      set(10),
      set(30, { sessionId: "old", exerciseId: "row", nameEs: "Remo" }),
    ],
    links: [...LINKS, link({ exerciseId: "row", group: "upper-back" })],
    now: NOW,
  });

  it("separa los grupos por estado", () => {
    const states = groupByState(recoveries);
    expect(states.worked.map((item) => item.group)).toEqual([
      "chest",
      "deltoids",
      "triceps",
    ]);
    expect(states.recovering.map((item) => item.group)).toEqual(["upper-back"]);
    expect(states.ready).toHaveLength(11);
  });

  it("agrupa por porcentaje de menos a más recuperado", () => {
    const lines = groupByPercent(
      groupByState(recoveries).recovering.concat(
        groupByState(recoveries).worked,
      ),
    );
    expect(lines.map((line) => [line.percent, line.groups.length])).toEqual([
      [21, 1],
      [42, 2],
      [63, 1],
    ]);
  });

  it("pinta cada grupo con el color de su estado en las dos vistas", () => {
    const colors = getSemanticColors("dark");
    const paint = recoveryPaint(recoveries, colors);
    expect(paint.chest).toEqual({ color: colors.recoveryWorked, view: "both" });
    expect(paint["upper-back"]?.color).toBe(colors.recoveryRecovering);
    expect(paint.calves?.color).toBe(colors.recoveryReady);
  });

  it("da la última vez trabajada de un conjunto de grupos", () => {
    expect(latestWorkedAt(groupByState(recoveries).worked)).toBe(
      NOW - 10 * HOUR,
    );
    expect(latestWorkedAt([])).toBeNull();
  });
});

describe("relativeDay", () => {
  it("dice hoy, ayer o hace N días según el día calendario", () => {
    expect(relativeDay(new Date(2026, 9, 2, 8).getTime(), NOW)).toEqual({
      kind: "today",
    });
    expect(relativeDay(new Date(2026, 9, 1, 22).getTime(), NOW)).toEqual({
      kind: "yesterday",
    });
    expect(relativeDay(new Date(2026, 8, 29, 10).getTime(), NOW)).toEqual({
      kind: "daysAgo",
      days: 3,
    });
  });
});

describe("todayInsight", () => {
  const recoveries = computeRecovery({
    sets: [set(24)],
    links: LINKS,
    now: NOW,
  });

  it("avisa de los grupos de hoy que aún no están al 100% con el ejercicio que los cargó", () => {
    const insight = todayInsight(["chest", "triceps"], recoveries);
    expect(insight?.groups).toEqual(["chest"]);
    expect(insight?.percent).toBe(50);
    expect(insight?.cause?.nameEs).toBe("Press de banca");
  });

  it("no avisa si los grupos de hoy ya están listos o si no hay entreno", () => {
    expect(todayInsight(["calves"], recoveries)).toBeNull();
    expect(todayInsight([], recoveries)).toBeNull();
  });
});
