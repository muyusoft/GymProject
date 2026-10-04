import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { WeeklyPlan } from "../types/plan.types";

interface WeeklyPlanHeaderProps {
  plan: WeeklyPlan;
}

export function WeeklyPlanHeader({ plan }: WeeklyPlanHeaderProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const weekOf = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
  }).format(plan.weekStart);
  const doneCount = plan.days.filter((day) => day.isDone).length;

  return (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: c.textSecondary }]}>
        {t(plan.repeatsWeekly ? "plan.eyebrow.repeats" : "plan.eyebrow.once")}
      </Text>
      <Text style={[styles.title, { color: c.text }]}>{plan.name}</Text>
      <View style={styles.chips}>
        <Badge label={t("plan.chips.days", { count: plan.days.length })} />
        <Badge label={t("plan.chips.exercises", { count: plan.totalExercises })} />
        <Badge
          label={t("plan.chips.base", { sets: plan.defaults.sets, reps: plan.defaults.reps })}
        />
      </View>
      <View style={styles.weekRow}>
        <Text style={[styles.eyebrow, { color: c.textSecondary }]}>
          {t("plan.weekOf", { date: weekOf })}
        </Text>
        <Text style={[styles.eyebrow, { color: c.accentText }]}>
          {t("plan.completed", { done: doneCount, total: plan.days.length })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: tokens.spacing[3] },
  eyebrow: getTextStyle("label"),
  title: getTextStyle("displayLg"),
  chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: tokens.spacing[2],
  },
});
