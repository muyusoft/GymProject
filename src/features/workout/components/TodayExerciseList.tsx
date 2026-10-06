import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { ExerciseInfoButton } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { TodayExercise } from "../types/workout.types";
import { formatSetsAndWeight } from "../utils/template.utils";

const PREVIEW_COUNT = 3;
const ICON_SIZE = 20;

interface TodayExerciseListProps {
  title: string;
  exercises: readonly TodayExercise[];
  /** Sin esto la lista es de solo lectura (por ejemplo, con el entreno ya terminado). */
  onSubstitute?: ((exercise: TodayExercise) => void) | undefined;
}

export function TodayExerciseList({
  title,
  exercises,
  onSubstitute,
}: Readonly<TodayExerciseListProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const hidden = exercises.length - PREVIEW_COUNT;
  const visible = isExpanded ? exercises : exercises.slice(0, PREVIEW_COUNT);

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        {visible.map((exercise) => {
          const name = getExerciseName(exercise, i18n.language);
          return (
            <View key={exercise.exerciseId} style={styles.row}>
              <View style={styles.texts}>
                <Text style={[styles.name, { color: c.text }]}>{name}</Text>
                <Text style={[styles.summary, { color: c.textSecondary }]}>
                  {formatSetsAndWeight(exercise.template, i18n.language)}
                </Text>
                {exercise.slot.isSubstituted && (
                  <Text style={[styles.more, { color: c.textSecondary }]}>
                    {t("substitute.active")}
                  </Text>
                )}
              </View>
              <ExerciseInfoButton
                exerciseId={exercise.exerciseId}
                name={name}
              />
              {onSubstitute && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("substitute.title", { name })}
                  onPress={() => onSubstitute(exercise)}
                  style={styles.action}
                >
                  <IconRenderer
                    name="arrow-right-left"
                    size={ICON_SIZE}
                    color={c.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          );
        })}
        {hidden > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            onPress={() => setIsExpanded((current) => !current)}
            style={styles.toggle}
          >
            <Text style={[styles.more, { color: c.textSecondary }]}>
              {isExpanded
                ? t("today.fewerExercises")
                : t("today.moreExercises", { count: hidden })}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  title: getTextStyle("label"),
  card: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  texts: { flex: 1 },
  name: getTextStyle("title"),
  summary: getTextStyle("body"),
  action: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  toggle: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  more: getTextStyle("bodySm"),
});
