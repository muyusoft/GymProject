import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { TodayExercise } from "../types/workout.types";
import { formatSetsAndWeight } from "../utils/template.utils";

const PREVIEW_COUNT = 3;

interface TodayExerciseListProps {
  exercises: readonly TodayExercise[];
}

export function TodayExerciseList({ exercises }: TodayExerciseListProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const hidden = exercises.length - PREVIEW_COUNT;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.textSecondary }]}>{t("today.exercisesTitle")}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        {exercises.slice(0, PREVIEW_COUNT).map((exercise) => (
          <View key={exercise.exerciseId} style={styles.row}>
            <Text style={[styles.name, { color: c.text }]}>
              {getExerciseName(exercise, i18n.language)}
            </Text>
            <Text style={[styles.summary, { color: c.textSecondary }]}>
              {formatSetsAndWeight(exercise.template, i18n.language)}
            </Text>
          </View>
        ))}
        {hidden > 0 && (
          <Text style={[styles.more, { color: c.textSecondary }]}>
            {t("today.moreExercises", { count: hidden })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  title: getTextStyle("label"),
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  row: { flexDirection: "row", justifyContent: "space-between", gap: tokens.spacing[3] },
  name: { ...getTextStyle("title"), flex: 1 },
  summary: getTextStyle("body"),
  more: getTextStyle("bodySm"),
});
