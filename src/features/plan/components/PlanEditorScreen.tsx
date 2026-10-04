import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, InlineError, ScreenHeader, Toggle } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useDayActions } from "../hooks/use-day-actions";
import { usePlanEditor } from "../hooks/use-plan-editor";
import { DayActionsSheet } from "./DayActionsSheet";
import { PlanDayList } from "./PlanDayList";
import { PlanNameInput } from "./PlanNameInput";

export function PlanEditorScreen() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const editor = usePlanEditor();
  const { plan, draft } = editor;
  const actions = useDayActions(editor.reload);

  return (
    <AsyncStateView status={editor.status} onRetry={() => void editor.reload()}>
      {plan && draft && (
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.content}>
            <ScreenHeader
              eyebrow={t("plan.editor.eyebrow")}
              onBack={() => router.back()}
              trailing={
                <Button
                  variant="secondary"
                  label={t("plan.importNotes")}
                  icon="clipboard"
                  onPress={() => router.push("/import")}
                />
              }
            />
            <PlanNameInput
              value={draft.name}
              accessibilityLabel={t("plan.editor.nameLabel")}
              onChange={editor.setName}
            />
            <Text style={[styles.summary, { color: c.textSecondary }]}>
              {t("plan.editor.summary", { days: plan.days.length, exercises: plan.totalExercises })}
            </Text>
            <View style={[styles.card, { backgroundColor: c.surface }]}>
              <Toggle
                label={t("plan.editor.repeat")}
                description={t("plan.editor.repeatHint")}
                value={draft.repeatsWeekly}
                onChange={editor.setRepeatsWeekly}
              />
            </View>
            <PlanDayList
              plan={plan}
              onLongPressDay={actions.open}
              onAddDay={(weekday) => void editor.addDayAt(weekday)}
            />
            <Text style={[styles.hint, { color: c.textSecondary }]}>{t("plan.editor.hint")}</Text>
          </ScrollView>
          <View style={styles.footer}>
            {editor.hasError && <InlineError message={t("common.saveError")} />}
            <Button
              label={t("plan.editor.save")}
              block
              loading={editor.isSaving}
              onPress={() => void editor.save()}
            />
          </View>
          <DayActionsSheet
            day={actions.selected}
            freeWeekdays={plan.restWeekdays}
            hasError={actions.hasError}
            onMove={(weekday) => void actions.move(weekday)}
            onDuplicate={(weekday) => void actions.duplicate(weekday)}
            onRemove={() => void actions.remove()}
            onClose={actions.close}
          />
        </View>
      )}
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: tokens.spacing[3], padding: tokens.dimensions.screenGutter },
  summary: getTextStyle("bodySm"),
  card: { padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  hint: { ...getTextStyle("bodySm"), textAlign: "center" },
  footer: { gap: tokens.spacing[3], padding: tokens.dimensions.screenGutter },
});
