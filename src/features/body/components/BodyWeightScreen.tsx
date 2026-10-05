import { router } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useBodyWeight } from "../hooks/use-body-weight";
import { useWeightEntry } from "../hooks/use-weight-entry";
import type { BodyView } from "../types/body.types";
import { BmiCard } from "./BmiCard";
import { WeeklyWeightChart } from "./WeeklyWeightChart";
import { WeighInCard } from "./WeighInCard";
import { WeighInReminderCard } from "./WeighInReminderCard";
import { WeightEntryCard } from "./WeightEntryCard";
import { WeightHistoryList } from "./WeightHistoryList";
import { WeightSummaryCard } from "./WeightSummaryCard";

interface BodyWeightContentProps {
  view: BodyView;
  onChanged: () => Promise<void>;
}

function BodyWeightContent({ view, onChanged }: Readonly<BodyWeightContentProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const entry = useWeightEntry({ view, onChanged });
  const hasEntries = view.recent.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader eyebrow={t("progress.title")} onBack={() => router.back()} />
      <Text style={[styles.title, { color: c.text }]}>{t("body.title")}</Text>
      <WeightEntryCard
        value={entry.value}
        unit={view.unit}
        todayEntry={view.todayEntry}
        isSaving={entry.isSaving}
        hasError={entry.hasError}
        onChange={entry.setValue}
        onSave={() => void entry.save()}
      />
      <WeighInCard logging={view.logging} />
      <WeighInReminderCard />
      <WeightSummaryCard view={view} />
      {hasEntries && <WeeklyWeightChart weeks={view.weeks} unit={view.unit} />}
      <BmiCard bmi={view.bmi} />
      {hasEntries && <WeightHistoryList entries={view.recent} onDelete={(id) => void entry.remove(id)} />}
    </ScrollView>
  );
}

export function BodyWeightScreen() {
  const { status, reload, view } = useBodyWeight();

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {view && <BodyWeightContent view={view} onChanged={reload} />}
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
});
