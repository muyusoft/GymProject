import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError, Stepper } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { WeightUnit } from "@/shared/types/training.types";
import { formatNumber, formatWeight } from "@/shared/utils/weight.utils";
import type { BodyWeightEntry } from "../types/body.types";
import { BODY_WEIGHT_STEPPER } from "../utils/body-view.utils";

interface WeightEntryCardProps {
  value: number;
  unit: WeightUnit;
  todayEntry: BodyWeightEntry | null;
  isSaving: boolean;
  hasError: boolean;
  onChange: (value: number) => void;
  onSave: () => void;
}

/** Registrar el peso de hoy sin teclado: un paso grande para acercarse y uno fino para la décima. */
export function WeightEntryCard({ value, unit, todayEntry, isSaving, hasError, onChange, onSave }: Readonly<WeightEntryCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const locale = i18n.language;
  const { coarse, fine, min, max } = BODY_WEIGHT_STEPPER[unit];

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.entry.title")}</Text>
      <Stepper
        value={value}
        step={coarse}
        min={min}
        max={max}
        unit={unit}
        onChange={onChange}
        formatValue={(current) => formatNumber(current, locale)}
      />
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.entry.fine")}</Text>
      <Stepper
        value={value}
        step={fine}
        min={min}
        max={max}
        unit={unit}
        onChange={onChange}
        formatValue={() => `± ${formatNumber(fine, locale)}`}
      />
      {todayEntry && (
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {t("body.entry.logged", { weight: formatWeight({ value: todayEntry.weight, unit: todayEntry.unit, locale }) })}
        </Text>
      )}
      {hasError && <InlineError message={t("common.saveError")} />}
      <Button
        label={t(todayEntry ? "body.entry.update" : "body.entry.save")}
        icon="scale"
        block
        loading={isSaving}
        onPress={onSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  note: getTextStyle("bodySm"),
});
