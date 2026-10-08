import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Stepper } from "@/shared/components";
import type { EquipmentIncrementRow } from "@/shared/db/types";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const STEP_SIZE = 0.5;
const MIN_STEP = 0.5;
const MAX_STEP = 25;

interface IncrementRowProps {
  increment: EquipmentIncrementRow;
  onChange: (id: string, step: number) => void;
}

export function IncrementRow({
  increment,
  onChange,
}: Readonly<IncrementRowProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: c.text }]}>
        {t(`settings.increment.${increment.equipment}`)}
      </Text>
      <Stepper
        value={increment.step}
        step={STEP_SIZE}
        min={MIN_STEP}
        max={MAX_STEP}
        unit={increment.unit}
        onChange={(step) => onChange(increment.id, step)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: tokens.spacing[2] },
  label: getTextStyle("body"),
});
