import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, BodyMap, EmptyState, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatNumber } from "@/shared/utils/weight.utils";
import { useDaySummary } from "../hooks/use-day-summary";
import { formatLongDate } from "../utils/date-label.utils";
import { exercisePaint } from "../utils/exercise-muscles.utils";
import { DayExerciseList } from "./DayExerciseList";
import { MapLegend } from "./MapLegend";

interface DaySummaryScreenProps {
  /** yyyy-MM-dd. */
  date: string;
}

/** Qué se hizo un día: duración, músculos trabajados (figura y series en texto) y cada ejercicio. */
export function DaySummaryScreen({ date }: DaySummaryScreenProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { status, reload, data, dayLinks, groups, minutes } = useDaySummary(date);
  const locale = i18n.language;
  const names = [...new Set(data?.sessions.flatMap((session) => (session.dayName ? [session.dayName] : [])) ?? [])];
  const setCount = data?.setEntries.length ?? 0;

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow={formatLongDate(date, locale)} onBack={() => router.back()} />
        {!data || data.sessions.length === 0 ? (
          <EmptyState title={t("daySummary.empty.title")} body={t("daySummary.empty.body")} />
        ) : (
          <>
            <View>
              <Text style={[styles.title, { color: c.text }]}>{names.join(" · ") || t("daySummary.fallbackTitle")}</Text>
              <Text style={[styles.stats, { color: c.textSecondary }]}>
                {t("daySummary.stats", { count: data.exercises.length, sets: setCount, minutes })}
              </Text>
            </View>
            <BodyMap mode="exercise" groups={exercisePaint(dayLinks, c)} />
            <MapLegend
              items={[
                { key: "primary", color: c.musclePrimary, label: t("muscles.primary") },
                { key: "secondary", color: c.muscleSecondary, label: t("muscles.secondary") },
                { key: "idle", color: c.muscleIdle, label: t("muscles.idle") },
              ]}
            />
            <View style={[styles.card, { backgroundColor: c.surface }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>{t("daySummary.muscles")}</Text>
              <Text style={[styles.groups, { color: c.text }]}>
                {groups.length > 0
                  ? groups.map((item) => `${t(`muscles.group.${item.group}`)} ${formatNumber(item.sets, locale)}`).join(" · ")
                  : t("daySummary.noMuscleData")}
              </Text>
            </View>
            <DayExerciseList exercises={data.exercises} />
          </>
        )}
      </ScrollView>
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  content: { gap: tokens.spacing[4], padding: tokens.dimensions.screenGutter, paddingBottom: tokens.spacing[12] },
  title: getTextStyle("displayLg"),
  stats: getTextStyle("body"),
  card: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  groups: getTextStyle("body"),
});
