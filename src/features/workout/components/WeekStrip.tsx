import { StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import type { WeekStripDay as WeekStripDayData } from "../types/workout.types";
import { WeekStripDay } from "./WeekStripDay";

interface WeekStripProps {
  days: readonly WeekStripDayData[];
  onSelectDay: (date: Date) => void;
}

/** Los días con sesión hecha se abren para ver qué se hizo. */
export function WeekStrip({ days, onSelectDay }: WeekStripProps) {
  return (
    <View style={styles.row}>
      {days.map((day) => (
        <WeekStripDay
          key={day.weekday}
          day={day}
          {...(day.status === "done" && { onPress: () => onSelectDay(day.date) })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: tokens.spacing[1] },
});
