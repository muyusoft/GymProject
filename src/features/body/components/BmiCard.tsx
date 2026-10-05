import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, Stepper } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSettingsStore } from "@/shared/store";
import { HEIGHT_NOT_SET, MAX_HEIGHT_CM, MIN_HEIGHT_CM } from "@/shared/utils/settings-values.utils";
import { formatNumber } from "@/shared/utils/weight.utils";
import type { BmiResult } from "../types/body.types";

const DEFAULT_HEIGHT_CM = 170;
const HEIGHT_UNIT = "cm";

interface BmiCardProps {
  bmi: BmiResult | null;
}

/** El IMC es un extra de referencia: va en texto neutro, con su rango y la nota de que no distingue músculo de grasa. */
export function BmiCard({ bmi }: Readonly<BmiCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const heightCm = useSettingsStore((state) => state.heightCm);
  const update = useSettingsStore((state) => state.update);
  const hasHeight = heightCm !== HEIGHT_NOT_SET;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.bmi.label")}</Text>
      {bmi && (
        <Text style={[styles.value, { color: c.text }]}>
          {t("body.bmi.value", { value: formatNumber(bmi.value, i18n.language), category: t(`body.bmi.category.${bmi.category}`) })}
        </Text>
      )}
      <Text style={[styles.note, { color: c.textSecondary }]}>{t(hasHeight ? "body.bmi.note" : "body.bmi.missing")}</Text>
      {hasHeight ? (
        <>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.bmi.height")}</Text>
          <Stepper
            value={heightCm}
            step={1}
            min={MIN_HEIGHT_CM}
            max={MAX_HEIGHT_CM}
            unit={HEIGHT_UNIT}
            onChange={(value) => void update("heightCm", value)}
          />
        </>
      ) : (
        <Button variant="secondary" label={t("body.bmi.addHeight")} block onPress={() => void update("heightCm", DEFAULT_HEIGHT_CM)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  value: getTextStyle("title"),
  note: getTextStyle("bodySm"),
});
