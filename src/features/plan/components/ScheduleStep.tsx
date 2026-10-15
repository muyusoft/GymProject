import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import {
  EXPERIENCE_LEVELS,
  TRAINING_DAY_COUNTS,
  type ExperienceLevel,
  type TrainingDayCount,
} from "../types/plan-generator.types";
import { QUESTION_COUNT } from "../hooks/use-plan-wizard";
import { ChoiceCard } from "./ChoiceCard";
import { NumberChoice } from "./NumberChoice";
import { WizardQuestion } from "./WizardQuestion";

interface ScheduleStepProps {
  days: TrainingDayCount;
  experience: ExperienceLevel;
  onDays: (days: TrainingDayCount) => void;
  onExperience: (experience: ExperienceLevel) => void;
}

/** Paso 2: cuántos días (define el tipo de rutina) y la experiencia (series y variantes). */
export function ScheduleStep({ days, experience, onDays, onExperience }: Readonly<ScheduleStepProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <WizardQuestion eyebrow={t("plan.wizard.step", { current: 2, total: QUESTION_COUNT })} title={t("plan.wizard.schedule.title")}>
      <NumberChoice
        options={TRAINING_DAY_COUNTS}
        value={days}
        labelFor={(count) => t("plan.wizard.schedule.dayCount", { count })}
        onChange={onDays}
      />
      <Text style={[styles.hint, { color: c.textSecondary }]}>{t(`plan.wizard.schedule.split.${days}`)}</Text>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("plan.wizard.schedule.experience")}</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {EXPERIENCE_LEVELS.map((level) => (
          <ChoiceCard
            key={level}
            title={t(`plan.wizard.schedule.levels.${level}.title`)}
            body={t(`plan.wizard.schedule.levels.${level}.body`)}
            isSelected={experience === level}
            onPress={() => onExperience(level)}
          />
        ))}
      </View>
    </WizardQuestion>
  );
}

const styles = StyleSheet.create({
  hint: getTextStyle("bodySm"),
  label: getTextStyle("label"),
  options: { gap: tokens.spacing[2] },
});
