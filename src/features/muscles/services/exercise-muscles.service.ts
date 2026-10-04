import { inArray } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listAllExerciseMuscles } from "@/shared/db/queries/exercise.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { listPlanExercisesByDay } from "@/shared/db/queries/plan-exercise.queries";
import { sources } from "@/shared/db/schema";
import type { PlanDayRow } from "@/shared/db/types";
import { weekdayIndex } from "@/shared/utils/week.utils";
import type { DayExerciseMuscles, SourceInfo } from "../types/muscles.types";
import { shortCitation, toMuscleLink, uniqueSourceIds } from "../utils/exercise-muscles.utils";

export interface DayMusclesData {
  dayName: string;
  weekday: number;
  exercises: DayExerciseMuscles[];
}

/** El día pedido; sin día, el de hoy; y si hoy es descanso, el primero del plan. */
function pickDay(days: readonly PlanDayRow[], dayId: string | undefined, now: Date): PlanDayRow | undefined {
  return (
    days.find((day) => day.id === dayId) ??
    days.find((day) => day.weekday === weekdayIndex(now)) ??
    days[0]
  );
}

async function loadSources(ids: readonly string[]): Promise<Map<string, SourceInfo>> {
  if (ids.length === 0) return new Map();
  const rows = await db.select().from(sources).where(inArray(sources.id, [...ids]));
  return new Map(rows.map((row) => [row.id, { id: row.id, citation: shortCitation(row.citation), url: row.url }]));
}

/** Los ejercicios de un día del plan con los músculos que trabaja cada uno y la fuente de cada dato. */
export async function loadDayMuscles(dayId: string | undefined, now: Date): Promise<DayMusclesData | null> {
  const plan = await findActivePlan();
  const day = plan ? pickDay(await listPlanDays(plan.id), dayId, now) : undefined;
  if (!day) return null;

  const [planExercises, rows] = await Promise.all([listPlanExercisesByDay(day.id), listAllExerciseMuscles()]);
  const links = rows.map(toMuscleLink);
  const sourceById = await loadSources(uniqueSourceIds(links));

  return {
    dayName: day.name,
    weekday: day.weekday,
    exercises: planExercises.map(({ exercise }) => {
      const own = links.filter((link) => link.exerciseId === exercise.id);
      return {
        exerciseId: exercise.id,
        nameEs: exercise.nameEs,
        nameEn: exercise.nameEn,
        links: own,
        sources: uniqueSourceIds(own).flatMap((id) => sourceById.get(id) ?? []),
      };
    }),
  };
}
