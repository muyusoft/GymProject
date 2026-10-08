import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import {
  AsyncStateView,
  BodyMap,
  Chip,
  EmptyState,
  ScreenHeader,
} from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { useExerciseMuscles } from "../hooks/use-exercise-muscles";
import { exercisePaint } from "../utils/exercise-muscles.utils";
import { MapLegend } from "./MapLegend";
import { MuscleDetailCard } from "./MuscleDetailCard";

interface ExerciseMusclesScreenProps {
  dayId?: string | undefined;
}

export function ExerciseMusclesScreen({
  dayId,
}: Readonly<ExerciseMusclesScreenProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, reload, data, selected, select } = useExerciseMuscles(dayId);

  const eyebrow = data
    ? t("muscles.byExercise.eyebrow", {
        weekday: t(`weekday.long.${data.weekday}`),
        day: data.dayName,
      })
    : t("muscles.byExercise.title");

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow={eyebrow} onBack={() => router.back()} />
        <Text style={[styles.title, { color: c.text }]}>
          {t("muscles.byExercise.title")}
        </Text>
        {!data || data.exercises.length === 0 ? (
          <EmptyState title={t("muscles.byExercise.empty")} />
        ) : (
          <>
            <View style={styles.chips}>
              {data.exercises.map((exercise) => (
                <Chip
                  key={exercise.exerciseId}
                  label={getExerciseName(exercise, i18n.language)}
                  selected={exercise.exerciseId === selected?.exerciseId}
                  onPress={() => select(exercise.exerciseId)}
                />
              ))}
            </View>
            <BodyMap
              mode="exercise"
              groups={selected ? exercisePaint(selected.links, c) : {}}
            />
            <MapLegend
              items={[
                {
                  key: "primary",
                  color: c.musclePrimary,
                  label: t("muscles.primary"),
                },
                {
                  key: "secondary",
                  color: c.muscleSecondary,
                  label: t("muscles.secondary"),
                },
                { key: "idle", color: c.muscleIdle, label: t("muscles.idle") },
              ]}
            />
            {selected && <MuscleDetailCard exercise={selected} />}
          </>
        )}
      </ScrollView>
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: tokens.spacing[4],
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[12],
  },
  title: getTextStyle("displayLg"),
  chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
