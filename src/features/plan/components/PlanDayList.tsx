import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import type { DaySummary, WeeklyPlan } from "../types/plan.types";
import { EditorDayRow } from "./EditorDayRow";
import { RestDayRow } from "./RestDayRow";

interface PlanDayListProps {
  plan: WeeklyPlan;
  onLongPressDay: (day: DaySummary) => void;
  onAddDay: (weekday: number) => void;
}

/** Días del plan (abrir con toque, opciones con pulsación larga) y descansos que se pueden convertir en día. */
export function PlanDayList({ plan, onLongPressDay, onAddDay }: Readonly<PlanDayListProps>) {
  return (
    <View style={styles.list}>
      {plan.days.map((day) => (
        <EditorDayRow
          key={day.id}
          day={day}
          onPress={() => router.push({ pathname: "/plan/day/[id]", params: { id: day.id } })}
          onLongPress={() => onLongPressDay(day)}
        />
      ))}
      {plan.restWeekdays.map((weekday) => (
        <RestDayRow key={weekday} weekday={weekday} onPress={() => onAddDay(weekday)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing[3] },
});
