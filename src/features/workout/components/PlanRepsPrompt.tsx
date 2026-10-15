import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { usePlanReps } from "../hooks/use-plan-reps";
import type { SessionExercise } from "../types/workout.types";

interface PlanRepsPromptProps {
  exercise: SessionExercise;
  /** Recarga la sesión: la plantilla del ejercicio cambia con el plan. */
  onUpdated: () => Promise<void>;
}

/** Al terminar un ejercicio con otras reps que las del plan: actualizar el plan, solo este día o en todos. */
export function PlanRepsPrompt({ exercise, onUpdated }: Readonly<PlanRepsPromptProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { reps, update, dismiss, isSaving, hasError } = usePlanReps(exercise, onUpdated);

  if (reps === null) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.question, { color: c.text }]}>
        {t("session.planReps.question", { reps })}
      </Text>
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        {t("session.planReps.hint", { reps, planReps: exercise.template.reps ?? 0 })}
      </Text>
      {hasError && <InlineError message={t("common.saveError")} />}
      <Button
        variant="secondary"
        label={t("session.planReps.day")}
        block
        disabled={isSaving}
        onPress={() => update("day")}
      />
      <Button
        variant="secondary"
        label={t("session.planReps.all", { exercise: getExerciseName(exercise, i18n.language) })}
        block
        disabled={isSaving}
        onPress={() => update("all")}
      />
      <Button variant="ghost" label={t("session.planReps.no")} block disabled={isSaving} onPress={dismiss} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  question: getTextStyle("title"),
  hint: getTextStyle("bodySm"),
});
