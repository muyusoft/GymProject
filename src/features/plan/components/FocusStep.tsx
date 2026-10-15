import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { PLAN_FOCUSES, SESSION_MINUTES, type PlanFocus, type SessionMinutes } from "../types/plan-generator.types";
import { QUESTION_COUNT } from "../hooks/use-plan-wizard";
import { ChoiceCard } from "./ChoiceCard";
import { NumberChoice } from "./NumberChoice";
import { WizardQuestion } from "./WizardQuestion";

const ICON_SIZE = 22;

interface FocusStepProps {
  focus: PlanFocus;
  minutes: SessionMinutes;
  onFocus: (focus: PlanFocus) => void;
  onMinutes: (minutes: SessionMinutes) => void;
}

/** Paso 3: qué priorizar (se pregunta directo en vez de suponerlo por el género) y cuánto dura cada sesión. */
export function FocusStep({ focus, minutes, onFocus, onMinutes }: Readonly<FocusStepProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <WizardQuestion eyebrow={t("plan.wizard.step", { current: 3, total: QUESTION_COUNT })} title={t("plan.wizard.focus.title")}>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {PLAN_FOCUSES.map((option) => (
          <ChoiceCard
            key={option}
            title={t(`plan.wizard.focus.options.${option}.title`)}
            body={t(`plan.wizard.focus.options.${option}.body`)}
            isSelected={focus === option}
            onPress={() => onFocus(option)}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("plan.wizard.focus.minutes")}</Text>
      <NumberChoice
        options={SESSION_MINUTES}
        value={minutes}
        labelFor={(option) => t("plan.wizard.focus.minutesOption", { count: option })}
        onChange={onMinutes}
      />
      <View style={[styles.equipment, { backgroundColor: c.surface }]}>
        <IconRenderer name="dumbbell" size={ICON_SIZE} color={c.textSecondary} />
        <View style={styles.texts}>
          <Text style={[styles.title, { color: c.text }]}>{t("plan.wizard.focus.equipment")}</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{t("plan.wizard.focus.equipmentSoon")}</Text>
        </View>
      </View>
    </WizardQuestion>
  );
}

const styles = StyleSheet.create({
  options: { gap: tokens.spacing[2] },
  equipment: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  label: getTextStyle("label"),
  texts: { flex: 1 },
  title: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  body: getTextStyle("bodySm"),
});
