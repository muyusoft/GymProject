import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { QUESTION_COUNT, usePlanWizard } from "../hooks/use-plan-wizard";
import { EquipmentStep } from "./EquipmentStep";
import { FocusStep } from "./FocusStep";
import { GoalStep } from "./GoalStep";
import { PreviewStep } from "./PreviewStep";
import { ScheduleStep } from "./ScheduleStep";
import { WizardTopBar } from "./WizardTopBar";

/** "Crear un plan para mí": tres preguntas y la vista previa del plan que sale de ellas. */
export function PlanWizardScreen() {
  const { t } = useTranslation();
  const wizard = usePlanWizard();
  const { step, stepIndex, answers, answer } = wizard;
  const isPreview = step === "preview";

  return (
    <View style={styles.screen}>
      <WizardTopBar
        progress={isPreview ? null : { current: stepIndex, total: QUESTION_COUNT }}
        onBack={() => {
          if (!wizard.back()) router.back();
        }}
        onClose={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {step === "goal" && <GoalStep value={answers.goal} onChange={(goal) => answer("goal", goal)} />}
        {step === "schedule" && (
          <ScheduleStep
            days={answers.days}
            experience={answers.experience}
            onDays={(days) => answer("days", days)}
            onExperience={(experience) => answer("experience", experience)}
          />
        )}
        {step === "focus" && (
          <FocusStep
            focus={answers.focus}
            minutes={answers.minutes}
            onFocus={(focus) => answer("focus", focus)}
            onMinutes={(minutes) => answer("minutes", minutes)}
          />
        )}
        {step === "equipment" && (
          <EquipmentStep value={answers.equipment} onChange={(equipment) => answer("equipment", equipment)} />
        )}
        {isPreview && <PreviewStep answers={answers} onChangeAnswers={wizard.restart} />}
      </ScrollView>
      {!isPreview && (
        <View style={styles.footer}>
          <Button
            label={t(step === "equipment" ? "plan.wizard.seePlan" : "common.next")}
            block
            onPress={wizard.next}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[8],
  },
  footer: { padding: tokens.dimensions.screenGutter },
});
