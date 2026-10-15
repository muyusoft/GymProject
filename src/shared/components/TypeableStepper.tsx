import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import {
  isAtMax,
  isAtMin,
  parseTypedValue,
  stepValue,
} from "@/shared/utils/stepper.utils";
import { StepperButton } from "./StepperButton";

interface TypeableStepperProps {
  value: number;
  step: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

/**
 * Un stepper cuyo número también se puede escribir: tocarlo abre el teclado numérico. Los botones siguen
 * siendo el camino principal (registrar una serie nunca exige el teclado); escribir es para saltos grandes.
 */
export function TypeableStepper({
  value,
  step,
  min,
  max,
  unit,
  onChange,
  formatValue = String,
}: Readonly<TypeableStepperProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const range = { min, max };
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const typed = draft === null ? null : parseTypedValue(draft, range);
    // Un texto que no es número se descarta y queda el valor anterior.
    if (typed !== null && typed !== value) onChange(typed);
    setDraft(null);
  };

  return (
    <View style={styles.row}>
      <StepperButton
        icon="minus"
        accessibilityLabel={t("stepper.decrease")}
        isDisabled={isAtMin(value, range)}
        onPress={() => onChange(stepValue(value, -step, range))}
      />
      {draft === null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("stepper.type", { value: formatValue(value), unit })}
          onPress={() => setDraft(String(value))}
          style={styles.value}
        >
          <Text style={[styles.number, { color: c.text }]}>
            {formatValue(value)}
            {unit ? " " : ""}
            <Text style={[styles.unit, { color: c.textSecondary }]}>{unit}</Text>
          </Text>
        </Pressable>
      ) : (
        <TextInput
          autoFocus
          selectTextOnFocus
          keyboardType="decimal-pad"
          returnKeyType="done"
          accessibilityLabel={t("stepper.typeField", { unit })}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={commit}
          onBlur={commit}
          style={[
            styles.value,
            styles.number,
            styles.input,
            { color: c.text, borderColor: c.accent },
          ]}
        />
      )}
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
  value: {
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    justifyContent: "center",
  },
  number: { ...getTextStyle("numeric"), textAlign: "center" },
  unit: getTextStyle("bodySm"),
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: tokens.borderRadius.md,
  },
});
