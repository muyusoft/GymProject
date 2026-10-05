import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { ExerciseSteps as Steps } from "../types/exercise-info.types";

interface ExerciseStepsProps {
  content: Steps;
}

/** Los pasos numerados; avisa si aún no hay instrucciones o si están sin traducir. */
export function ExerciseSteps({ content }: Readonly<ExerciseStepsProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const { steps, isUntranslated } = content;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("exerciseInfo.steps.title")}</Text>
      {steps.length === 0 && <Text style={[styles.note, { color: c.textSecondary }]}>{t("exerciseInfo.steps.none")}</Text>}
      {isUntranslated && <Text style={[styles.note, { color: c.textSecondary }]}>{t("exerciseInfo.steps.untranslated")}</Text>}
      {steps.map((step, position) => (
        // Los pasos no tienen id y su orden es fijo: la posición es su identidad.
        <View key={`${position}-${step}`} style={styles.step}>
          <Text style={[styles.number, { color: c.textSecondary }]}>{t("exerciseInfo.steps.number", { number: position + 1 })}</Text>
          <Text style={[styles.text, { color: c.text }]}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  note: getTextStyle("bodySm"),
  step: { flexDirection: "row", gap: tokens.spacing[3] },
  number: { ...getTextStyle("title"), minWidth: tokens.spacing[6] },
  text: { ...getTextStyle("body"), flex: 1 },
});
