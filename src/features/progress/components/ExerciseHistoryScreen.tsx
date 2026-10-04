import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, EmptyState, ProgressionHint, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { convertWeight, formatNumber, formatWeight } from "@/shared/utils/weight.utils";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { muscleLabelKey } from "@/shared/utils/muscle-label.utils";
import { useExerciseHistory } from "../hooks/use-exercise-history";
import { HistoryChart } from "./HistoryChart";
import { SessionHistoryList } from "./SessionHistoryList";
import { StatTile } from "./StatTile";

const KG_PER_TONNE = 1000;

interface ExerciseHistoryScreenProps {
  exerciseId: string;
}

export function ExerciseHistoryScreen({ exerciseId }: Readonly<ExerciseHistoryScreenProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, reload, data, stats, hint } = useExerciseHistory(exerciseId);
  const locale = i18n.language;

  const unit = data?.sessions[0]?.best.unit ?? "kg";
  const eyebrow = data
    ? [data.primary ? t(muscleLabelKey(data.primary)) : null, t(`equipment.${data.exercise.equipment}`)]
        .filter(Boolean)
        .join(" · ")
    : "";
  const planDays = data?.planWeekdays.map((weekday) => t(`weekday.long.${weekday}`).toLowerCase()).join(", ") ?? "";

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {data && (
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader eyebrow={eyebrow} onBack={() => router.back()} />
          <View>
            <Text style={[styles.title, { color: c.text }]}>{getExerciseName(data.exercise, locale)}</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {data.planWeekdays.length > 0 ? t("history.inPlan", { days: planDays }) : t("history.notInPlan")}
            </Text>
          </View>
          {stats && data.sessions.length > 0 ? (
            <>
              <View style={styles.tiles}>
                <StatTile
                  compact
                  label={t("history.tiles.oneRepMax")}
                  value={formatNumber(convertWeight(stats.oneRepMaxKg, "kg", unit), locale)}
                  unit={unit}
                />
                <StatTile
                  compact
                  label={t("history.tiles.bestSet")}
                  value={formatNumber(stats.bestSet.weight, locale)}
                  unit={`× ${stats.bestSet.reps}`}
                />
                <StatTile
                  compact
                  label={t("history.tiles.volume")}
                  value={formatNumber(stats.averageVolumeKg / KG_PER_TONNE, locale)}
                  unit={t("history.tiles.perSession")}
                />
              </View>
              <HistoryChart sessions={data.sessions} unit={unit} />
              {hint && (
                <ProgressionHint
                  kind="increase"
                  message={t("history.hint", {
                    sets: hint.sets,
                    reps: hint.reps,
                    next: formatWeight({ value: hint.nextWeight, unit: hint.unit, locale }),
                  })}
                  onDismiss={() => undefined}
                />
              )}
              <SessionHistoryList sessions={data.sessions} />
            </>
          ) : (
            <EmptyState title={t("history.empty")} />
          )}
        </ScrollView>
      )}
      {!data && status === "ready" && (
        <EmptyState title={t("history.notFound")} />
      )}
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
  subtitle: getTextStyle("bodySm"),
  tiles: { flexDirection: "row", gap: tokens.spacing[2] },
});
