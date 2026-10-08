import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { DayExercise } from "../types/muscles.types";
import { hasRecord, summarizeDayExercise } from "../utils/day-summary.utils";

const CHEVRON_SIZE = 20;

interface DayExerciseListProps {
  exercises: readonly DayExercise[];
}

/** Lo que se hizo de cada ejercicio; tocarlo abre su historial. Los récords del día van en ember. */
export function DayExerciseList({ exercises }: Readonly<DayExerciseListProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.textSecondary }]}>
        {t("daySummary.exercises")}
      </Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        {exercises.map((exercise) => {
          const name = getExerciseName(exercise, i18n.language);
          const summary = summarizeDayExercise(exercise, i18n.language);
          const isRecord = hasRecord(exercise);
          const recordSuffix = isRecord ? `, ${t("session.recordLabel")}` : "";
          return (
            <Pressable
              key={exercise.exerciseId}
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${summary}${recordSuffix}`}
              accessibilityHint={t("daySummary.historyHint")}
              onPress={() =>
                router.push({
                  pathname: "/exercise/[id]",
                  params: { id: exercise.exerciseId },
                })
              }
              style={styles.row}
            >
              <View style={styles.texts}>
                <Text style={[styles.name, { color: c.text }]}>{name}</Text>
                <Text style={[styles.summary, { color: c.textSecondary }]}>
                  {summary}
                </Text>
              </View>
              {isRecord && <Badge label={t("session.record")} tone="record" />}
              <IconRenderer
                name="chevron-right"
                size={CHEVRON_SIZE}
                color={c.textSecondary}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  title: getTextStyle("label"),
  card: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
  },
  texts: { flex: 1 },
  name: getTextStyle("title"),
  summary: getTextStyle("bodySm"),
});
