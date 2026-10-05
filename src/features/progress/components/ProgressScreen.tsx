import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, EmptyState, SegmentedControl } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatNumber } from "@/shared/utils/weight.utils";
import { useProgress } from "../hooks/use-progress";
import { PROGRESS_RANGES } from "../types/progress.types";
import { ExercisePicker } from "./ExercisePicker";
import { OneRepMaxCard } from "./OneRepMaxCard";
import { RecordsCard } from "./RecordsCard";
import { StatTile } from "./StatTile";

export function ProgressScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const progress = useProgress();
  const { view } = progress;
  const locale = i18n.language;

  const rangeOptions = PROGRESS_RANGES.map((value) => ({ value, label: t(`progress.range.${value}`) }));
  const volumeChange = view?.volume.change ?? null;
  const volumeDelta =
    view?.volume.trend && volumeChange !== null
      ? {
          direction: view.volume.trend.direction,
          text: t("progress.volume.vsPrevious", { percent: `${Math.abs(Math.round(volumeChange * 100))}%` }),
        }
      : undefined;

  return (
    <AsyncStateView status={progress.status} onRetry={() => void progress.reload()}>
      {view && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: c.text }]}>{t("progress.title")}</Text>
          <SegmentedControl options={rangeOptions} value={progress.range} onChange={progress.setRange} />
          {view.isEmpty || !view.featured ? (
            <EmptyState title={t("progress.empty.title")} body={t("progress.empty.body")} />
          ) : (
            <>
              <ExercisePicker items={view.picker} all={view.all} selectedId={progress.selectedId} onSelect={progress.select} />
              <OneRepMaxCard featured={view.featured} />
            </>
          )}
          <View style={styles.tiles}>
            <StatTile
              label={t("progress.volume.label")}
              value={formatNumber(view.volume.tonnes, locale)}
              unit={t("progress.volume.unit")}
              caption={t("progress.volume.note")}
              {...(volumeDelta && { delta: volumeDelta })}
            />
            <StatTile
              label={t("progress.sessions.label")}
              value={String(view.month.done)}
              unit={`/${view.month.planned}`}
              {...(view.month.percent !== null && {
                caption: t("progress.sessions.planned", { percent: view.month.percent }),
              })}
            />
          </View>
          <RecordsCard records={view.records} />
          <Button variant="secondary" label={t("progress.muscleSets")} icon="body" block onPress={() => router.push("/progress/muscles")} />
          <Button variant="secondary" label={t("progress.bodyWeight")} icon="scale" block onPress={() => router.push("/body")} />
        </ScrollView>
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
  tiles: { flexDirection: "row", gap: tokens.spacing[3] },
});
