import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { PLAN_GOALS, type PlanGoal } from "../types/plan-generator.types";
import { QUESTION_COUNT } from "../hooks/use-plan-wizard";
import { ChoiceCard } from "./ChoiceCard";
import { WizardQuestion } from "./WizardQuestion";

const ICON_SIZE = 20;

interface GoalStepProps {
  value: PlanGoal;
  onChange: (goal: PlanGoal) => void;
}

/** Paso 1: el objetivo. Aclara que subir o bajar de peso depende sobre todo de la alimentación. */
export function GoalStep({ value, onChange }: Readonly<GoalStepProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <WizardQuestion eyebrow={t("plan.wizard.step", { current: 1, total: QUESTION_COUNT })} title={t("plan.wizard.goal.title")}>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {PLAN_GOALS.map((goal) => (
          <ChoiceCard
            key={goal}
            title={t(`plan.wizard.goal.options.${goal}.title`)}
            body={t(`plan.wizard.goal.options.${goal}.body`)}
            isSelected={value === goal}
            onPress={() => onChange(goal)}
          />
        ))}
      </View>
      <View style={[styles.note, { backgroundColor: c.surfaceAlt }]}>
        <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
        <Text style={[styles.noteText, { color: c.textSecondary }]}>{t("plan.wizard.goal.note")}</Text>
      </View>
    </WizardQuestion>
  );
}

const styles = StyleSheet.create({
  options: { gap: tokens.spacing[2] },
  note: {
    flexDirection: "row",
    gap: tokens.spacing[3],
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
  },
  noteText: { ...getTextStyle("bodySm"), flex: 1 },
});
