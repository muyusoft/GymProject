import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { isAtMax, isAtMin, stepValue } from "@/shared/utils/stepper.utils";
import { StepperButton } from "./StepperButton";

interface StepperProps {
  value: number;
  step: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  /** Cómo se muestra el número (por ejemplo 90 → "1:30"). */
  formatValue?: (value: number) => string;
}

export function Stepper({
  value,
  step,
  min,
  max,
  unit,
  onChange,
  formatValue = String,
}: Readonly<StepperProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const range = { min, max };

  return (
    <View style={styles.row}>
      <StepperButton
        icon="minus"
        accessibilityLabel={t("stepper.decrease")}
        isDisabled={isAtMin(value, range)}
        onPress={() => onChange(stepValue(value, -step, range))}
      />
      <Text style={[styles.value, { color: c.text }]}>
        {formatValue(value)}
        {unit ? " " : ""}
        <Text style={[styles.unit, { color: c.textSecondary }]}>{unit}</Text>
      </Text>
      <StepperButton
        icon="plus"
        accessibilityLabel={t("stepper.increase")}
        isDisabled={isAtMax(value, range)}
        onPress={() => onChange(stepValue(value, step, range))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[4],
  },
  value: { ...getTextStyle("numeric"), flex: 1, textAlign: "center" },
  unit: getTextStyle("bodySm"),
});
