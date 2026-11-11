import { describe, expect, it } from "vitest";
import { reopenedStart } from "../utils/reopen.utils";

const MINUTE = 60_000;

describe("reopenedStart", () => {
  it("corre el inicio lo que estuvo cerrada: la duración sigue siendo la del entreno", () => {
    const startedAt = 0;
    const endedAt = 50 * MINUTE;
    const now = endedAt + 30 * MINUTE;
    const start = reopenedStart({ startedAt, endedAt, now });
    expect(now - start).toBe(endedAt - startedAt);
  });

  it("reabierta al instante no cambia", () => {
    expect(reopenedStart({ startedAt: 1000, endedAt: 5000, now: 5000 })).toBe(1000);
  });

  it("si el reloj va hacia atrás, el inicio no se mueve", () => {
    expect(reopenedStart({ startedAt: 1000, endedAt: 5000, now: 4000 })).toBe(1000);
  });
});
