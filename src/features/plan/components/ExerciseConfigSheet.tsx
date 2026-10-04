import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { useExerciseConfig } from "../hooks/use-exercise-config";
import { loadTypeUsesWeight } from "../utils/exercise-config.utils";
import { LoadTypeChips } from "./LoadTypeChips";
import { MetricSteppers } from "./MetricSteppers";
import { ProgressionToggle } from "./ProgressionToggle";
import { WeightPanel } from "./WeightPanel";

const CLOSE_ICON_SIZE = 24;

interface ExerciseConfigSheetProps {
  planExerciseId: string;
}

export function ExerciseConfigSheet({ planExerciseId }: ExerciseConfigSheetProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const form = useExerciseConfig(planExerciseId);
  const { config, draft } = form;
  const usesWeight = draft ? loadTypeUsesWeight(draft.loadType) : false;

  return (
    <AsyncStateView status={form.status} onRetry={() => void form.reload()}>
      {config && draft && (
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <View style={styles.titles}>
                <Text style={[styles.eyebrow, { color: c.textSecondary }]}>
                  {t(`equipment.${config.detail.exercise.equipment}`)}
                </Text>
                <Text style={[styles.title, { color: c.text }]}>
                  {getExerciseName(config.detail.exercise, i18n.language)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("plan.config.close")}
                onPress={() => router.back()}
                style={[styles.close, { backgroundColor: c.surfaceAlt }]}
              >
                <IconRenderer name="x" size={CLOSE_ICON_SIZE} color={c.text} />
              </Pressable>
            </View>
            <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{t("plan.config.loadType")}</Text>
            <LoadTypeChips value={draft.loadType} onChange={(loadType) => form.patchDraft({ loadType })} />
            {usesWeight && (
              <WeightPanel
                draft={draft}
                step={config.steps[draft.unit]}
                onWeightChange={(weight) => form.patchDraft({ weight })}
                onUnitChange={form.changeUnit}
              />
            )}
            <MetricSteppers draft={draft} onChange={form.patchDraft} />
            {usesWeight && (
              <ProgressionToggle
                draft={draft}
                step={config.steps[draft.unit]}
                onChange={(isProgressionEnabled) => form.patchDraft({ isProgressionEnabled })}
              />
            )}
          </ScrollView>
          <View style={styles.footer}>
            {form.hasError && <InlineError message={t("common.saveError")} />}
            <View style={styles.buttons}>
              <Button variant="danger" label={t("plan.config.remove")} onPress={() => void form.remove()} />
              <Button label={t("plan.config.save")} loading={form.isSaving} onPress={() => void form.save()} />
            </View>
          </View>
        </View>
      )}
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: tokens.spacing[4], paddingBottom: tokens.spacing[4] },
  header: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[3] },
  titles: { flex: 1, gap: tokens.spacing[1] },
  eyebrow: getTextStyle("label"),
  title: getTextStyle("displayLg"),
  close: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { gap: tokens.spacing[3] },
  buttons: { flexDirection: "row", justifyContent: "space-between", gap: tokens.spacing[3] },
});
