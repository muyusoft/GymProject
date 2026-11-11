import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { useRepRangeOffer } from "../hooks/use-rep-range-offer";

const BAR_WIDTH = 4;
const ICON_SIZE = 20;

/** Propone pasar a rango de reps los ejercicios con objetivo fijo: primero se suben reps y, en el tope, peso. */
export function RepRangeOffer() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const { count, apply, dismiss, isApplying, hasError } = useRepRangeOffer();
  if (count === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderLeftColor: c.info }]}>
      <View style={styles.row}>
        <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
        <Text style={[styles.title, { color: c.text }]}>{t("plan.repRangeOffer.title")}</Text>
      </View>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t("plan.repRangeOffer.body", { count })}
      </Text>
      {hasError && <InlineError message={t("common.saveError")} />}
      <View style={styles.actions}>
        <Button label={t("plan.repRangeOffer.apply")} loading={isApplying} onPress={() => void apply()} />
        <Button variant="ghost" label={t("plan.repRangeOffer.dismiss")} onPress={dismiss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
    borderLeftWidth: BAR_WIDTH,
  },
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  title: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold, flex: 1 },
  body: getTextStyle("bodySm"),
  actions: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
