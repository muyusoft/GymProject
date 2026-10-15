import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Badge, Button, EmptyState, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { usePlanPreview } from "../hooks/use-plan-preview";
import { usePreviewSwaps } from "../hooks/use-preview-swaps";
import type { PlanAnswers } from "../types/plan-generator.types";
import { PreviewDay } from "./PreviewDay";
import { PreviewNotices } from "./PreviewNotices";
import { SwapSheet } from "./SwapSheet";
import { WizardQuestion } from "./WizardQuestion";

interface PreviewStepProps {
  answers: PlanAnswers;
  onChangeAnswers: () => void;
}

/** La semana que sale de las respuestas, para revisarla antes de guardarla como plan. */
export function PreviewStep({ answers, onChangeAnswers }: Readonly<PreviewStepProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const preview = usePlanPreview(answers);
  const { status, reload, catalog, save, isSaving, hasError } = preview;
  const swaps = usePreviewSwaps(preview.plan, catalog, answers);
  const { plan } = swaps;
  // Sin tocar nada se ve desplegado el primer día; null = todos plegados.
  const [openChoice, setOpenWeekday] = useState<number | null | undefined>(undefined);
  const openWeekday = openChoice === undefined ? (plan?.days[0]?.weekday ?? null) : openChoice;
  const hasExercises = plan?.days.some((day) => day.exercises.length > 0) ?? false;

  return (
    <AsyncStateView status={status} onRetry={() => void reload()}>
      {plan && !hasExercises && <EmptyState title={t("plan.wizard.preview.emptyTitle")} body={t("plan.wizard.preview.emptyBody")} />}
      {plan && hasExercises && (
        <WizardQuestion eyebrow={t("plan.wizard.preview.eyebrow")} title={t("plan.wizard.preview.title")}>
          <View style={styles.badges}>
            <Badge label={t(`plan.wizard.goal.options.${answers.goal}.title`)} />
            <Badge label={t("plan.wizard.schedule.dayCount", { count: answers.days })} />
            <Badge label={t(`plan.wizard.focus.options.${answers.focus}.title`)} />
            <Badge label={t("plan.wizard.preview.minutes", { count: answers.minutes })} />
          </View>
          <Text style={[styles.note, { color: c.textSecondary }]}>{t("plan.wizard.swap.hint")}</Text>
          <View style={styles.days}>
            {plan.days.map((day) => (
              <PreviewDay
                key={day.weekday}
                day={day}
                catalog={catalog}
                isOpen={openWeekday === day.weekday}
                onToggle={() => setOpenWeekday(openWeekday === day.weekday ? null : day.weekday)}
                onSwap={(index) => swaps.open({ weekday: day.weekday, index })}
              />
            ))}
          </View>
          <PreviewNotices plan={plan} answers={answers} />
          <Text style={[styles.note, { color: c.textSecondary }]}>{t("plan.wizard.preview.note")}</Text>
          {hasError && <InlineError message={t("common.saveError")} />}
          <Button label={t("plan.wizard.preview.save")} block loading={isSaving} onPress={() => void save(plan)} />
          <Button variant="secondary" label={t("plan.wizard.preview.change")} block disabled={isSaving} onPress={onChangeAnswers} />
          <SwapSheet
            isOpen={swaps.target !== null}
            alternatives={swaps.alternatives}
            onChoose={swaps.choose}
            onClose={swaps.close}
          />
        </WizardQuestion>
      )}
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
  days: { gap: tokens.spacing[2] },
  note: getTextStyle("bodySm"),
});
