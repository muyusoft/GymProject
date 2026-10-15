import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { Movement } from "../types/warmup.types";

interface MovementStepsProps {
  movement: Movement;
}

/** "Cómo se hace": los pasos numerados del movimiento. */
export function MovementSteps({ movement }: Readonly<MovementStepsProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const numbers = Array.from({ length: movement.stepCount }, (_, index) => index + 1);

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("movementInfo.steps")}</Text>
      {numbers.map((number) => (
        <View key={`step-${number}`} style={styles.step}>
          <Text style={[styles.number, { color: c.textSecondary }]}>{number}</Text>
          <Text style={[styles.text, { color: c.text }]}>{t(`movement.${movement.id}.step${number}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  step: { flexDirection: "row", gap: tokens.spacing[3] },
  number: { ...getTextStyle("title"), minWidth: tokens.spacing[6] },
  text: { ...getTextStyle("body"), flex: 1 },
});
