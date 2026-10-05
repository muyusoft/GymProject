import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import type { useDayDraft } from "../hooks/use-day-draft";
import type { DayDetail } from "../types/plan.types";
import { DayDefaultsPanel } from "./DayDefaultsPanel";
import { useDayNameSuggestion } from "../hooks/use-day-name-suggestion";
import { PlanNameInput } from "./PlanNameInput";

interface DayEditorHeaderProps {
  detail: DayDetail;
  draft: ReturnType<typeof useDayDraft>;
}

export function DayEditorHeader({ detail, draft }: DayEditorHeaderProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const suggestedName = useDayNameSuggestion(detail.nameSuggestion);
  const minutes = estimateDurationMinutes(detail.exercises.map((entry) => entry.planExercise));
  const eyebrow = t("plan.day.eyebrow", {
    weekday: t(`weekday.long.${detail.day.weekday}`),
    plan: detail.planName,
  });

  return (
    <View style={styles.header}>
      <ScreenHeader eyebrow={eyebrow} onBack={() => router.back()} />
      <PlanNameInput
        value={draft.name}
        accessibilityLabel={t("plan.day.nameLabel")}
        onChange={draft.setName}
      />
      {suggestedName !== null && suggestedName !== draft.name.trim() && (
        <Button
          variant="ghost"
          icon="lightbulb"
          label={t("plan.day.suggest.use", { name: suggestedName })}
          onPress={() => draft.setName(suggestedName)}
        />
      )}
      {draft.defaults && (
        <DayDefaultsPanel defaults={draft.defaults} onChange={draft.setDefaults} />
      )}
      <View style={styles.meta}>
        <Text style={[styles.label, { color: c.textSecondary }]}>
          {t("plan.day.meta", { count: detail.exercises.length, minutes })}
        </Text>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("plan.day.reorderHint")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: tokens.spacing[3], paddingBottom: tokens.spacing[3] },
  meta: { flexDirection: "row", justifyContent: "space-between", gap: tokens.spacing[3] },
  label: { ...getTextStyle("bodySm"), flexShrink: 1 },
});
