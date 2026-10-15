import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { RampPlan } from "../hooks/use-ramp-sets";

interface RampSetsCardProps {
  plan: RampPlan;
  onHide: () => void;
}

/** Series de aproximación sugeridas: solo una guía, no se registran ni cuentan para récords. */
export function RampSetsCard({ plan, onHide }: Readonly<RampSetsCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.card, { borderColor: c.border }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{t("warmup.ramp.title")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("warmup.ramp.hide")}
          onPress={onHide}
          hitSlop={tokens.spacing[3]}
          style={styles.hide}
        >
          <Text style={[styles.hideText, { color: c.text }]}>{t("warmup.ramp.hide")}</Text>
        </Pressable>
      </View>
      {plan.sets.map((set, index) => (
        <View key={`ramp-${set.reps}-${set.weight ?? 0}`} style={styles.row}>
          <Text style={[styles.index, { color: c.textSecondary }]}>{t("warmup.ramp.index", { index: index + 1 })}</Text>
          <Text style={[styles.value, { color: c.text }]}>
            {set.weight === null
              ? t("warmup.ramp.empty")
              : formatWeight({ value: set.weight, unit: plan.unit, locale: i18n.language })}
          </Text>
          <Text style={[styles.value, { color: c.text }]}>{t("common.reps", { count: set.reps })}</Text>
        </View>
      ))}
      <Text style={[styles.note, { color: c.textSecondary }]}>{t("warmup.ramp.note")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: getTextStyle("label"),
  hide: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  hideText: getTextStyle("bodySm"),
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  index: { ...getTextStyle("label"), minWidth: tokens.spacing[8] },
  value: { ...getTextStyle("body"), flex: 1 },
  note: getTextStyle("bodySm"),
});
