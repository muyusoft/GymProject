import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { WeeklyPlan } from "../types/plan.types";
import { weekDates } from "@/shared/utils/week.utils";
import { DayCard } from "./DayCard";
import { RestDayRow } from "./RestDayRow";
import { WeekShiftNote } from "./WeekShiftNote";
import { weekNote } from "../utils/week-note.utils";
import { WeeklyPlanHeader } from "./WeeklyPlanHeader";

interface WeeklyPlanContentProps {
  plan: WeeklyPlan;
}

export function WeeklyPlanContent({ plan }: Readonly<WeeklyPlanContentProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <WeeklyPlanHeader plan={plan} />
      <View style={styles.days}>
        {weekDates(plan.weekStart).map((date, weekday) => {
          const day = plan.days.find((candidate) => candidate.weekday === weekday);
          const note = weekNote(plan.schedule, day?.id ?? null, weekday);
          return (
            <View key={date.toISOString()} style={styles.slot}>
              {day ? (
                <DayCard
                  day={day}
                  dayNumber={date.getDate()}
                  onPress={() => router.push({ pathname: "/plan/day/[id]", params: { id: day.id } })}
                />
              ) : (
                <RestDayRow weekday={weekday} dayNumber={date.getDate()} />
              )}
              {note && <WeekShiftNote note={note} days={plan.days} />}
            </View>
          );
        })}
      </View>
      {plan.days.length === 0 && (
        <>
          <Text style={[styles.hint, { color: c.textSecondary }]}>{t("plan.noDays")}</Text>
          {/* Un plan sin días todavía no empezó: el asistente sigue disponible y llena este mismo plan. */}
          <Button
            label={t("plan.empty.forMe")}
            icon="lightbulb"
            block
            onPress={() => router.push("/plan/wizard")}
          />
        </>
      )}
      <Button
        variant="secondary"
        label={t("plan.importNotes")}
        icon="clipboard"
        block
        onPress={() => router.push("/import")}
      />
      <Button
        variant={plan.days.length === 0 ? "secondary" : "primary"}
        label={t("plan.editPlan")}
        block
        onPress={() => router.push("/plan/edit")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: tokens.spacing[4],
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[12],
  },
  days: { gap: tokens.spacing[3] },
  slot: { gap: tokens.spacing[1] },
  hint: getTextStyle("bodySm"),
});
