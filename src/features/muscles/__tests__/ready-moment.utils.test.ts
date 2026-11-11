import { describe, expect, it } from "vitest";
import { readyMoment } from "../utils/ready-moment.utils";

const NOW = new Date(2026, 9, 27, 10).getTime();
const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();

describe("readyMoment", () => {
  it("dice hoy, mañana o el día de la semana", () => {
    expect(readyMoment(at(27, 15), NOW).day).toBe("today");
    expect(readyMoment(at(28, 15), NOW).day).toBe("tomorrow");
    expect(readyMoment(at(30, 15), NOW).day).toBe("weekday");
  });

  it("pone la franja según la hora local", () => {
    expect(readyMoment(at(28, 3), NOW).band).toBe("night");
    expect(readyMoment(at(28, 6), NOW).band).toBe("morning");
    expect(readyMoment(at(28, 12), NOW).band).toBe("afternoon");
    expect(readyMoment(at(28, 19), NOW).band).toBe("evening");
    expect(readyMoment(at(28, 23), NOW).band).toBe("evening");
  });
});
