import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { SegmentedControl, Stepper } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { WEIGHT_UNITS, type WeightUnit } from "@/shared/types/training.types";
import { convertWeight, formatNumber } from "@/shared/utils/weight.utils";
import type { ConfigDraft } from "../utils/exercise-config.utils";
import { CONFIG_LIMITS } from "../utils/exercise-config.utils";

interface WeightPanelProps {
  draft: ConfigDraft;
  step: number;
  onWeightChange: (weight: number) => void;
  onUnitChange: (unit: WeightUnit) => void;
}

export function WeightPanel({ draft, step, onWeightChange, onUnitChange }: Readonly<WeightPanelProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const otherUnit: WeightUnit = draft.unit === "lb" ? "kg" : "lb";
  const converted = formatNumber(convertWeight(draft.weight, draft.unit, otherUnit), i18n.language);

  return (
    <View style={[styles.panel, { backgroundColor: c.surfaceAlt }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: c.textSecondary }]}>
          {t(`plan.config.weight.${draft.loadType}`)}
        </Text>
        <SegmentedControl
          options={WEIGHT_UNITS.map((unit) => ({ value: unit, label: unit }))}
          value={draft.unit}
          onChange={onUnitChange}
        />
      </View>
      <Stepper
        value={draft.weight}
        step={step}
        min={CONFIG_LIMITS.weight.min}
        max={CONFIG_LIMITS.weight.max}
        unit={draft.unit}
        formatValue={(value) => formatNumber(value, i18n.language)}
        onChange={onWeightChange}
      />
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        {t("plan.config.conversion", {
          converted,
          unit: otherUnit,
          step: formatNumber(step, i18n.language),
          stepUnit: draft.unit,
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  header: { gap: tokens.spacing[2] },
  label: getTextStyle("label"),
  hint: { ...getTextStyle("bodySm"), textAlign: "center" },
});
