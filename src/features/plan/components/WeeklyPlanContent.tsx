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
import { WeeklyPlanHeader } from "./WeeklyPlanHeader";

interface WeeklyPlanContentProps {
  plan: WeeklyPlan;
}

export function WeeklyPlanContent({ plan }: WeeklyPlanContentProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <WeeklyPlanHeader plan={plan} />
      <View style={styles.days}>
        {weekDates(plan.weekStart).map((date, weekday) => {
          const day = plan.days.find((candidate) => candidate.weekday === weekday);
          if (!day) {
            return <RestDayRow key={weekday} weekday={weekday} dayNumber={date.getDate()} />;
          }
          return (
            <DayCard
              key={day.id}
              day={day}
              dayNumber={date.getDate()}
              onPress={() => router.push({ pathname: "/plan/day/[id]", params: { id: day.id } })}
            />
          );
        })}
      </View>
      {plan.days.length === 0 && (
        <Text style={[styles.hint, { color: c.textSecondary }]}>{t("plan.noDays")}</Text>
      )}
      <Button
        variant="secondary"
        label={t("plan.importNotes")}
        icon="clipboard"
        block
        onPress={() => router.push("/import")}
      />
      <Button
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
  hint: getTextStyle("bodySm"),
});
