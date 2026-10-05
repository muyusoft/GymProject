import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { IconName } from "@/shared/icons";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { formatNumber, formatWeight } from "@/shared/utils/weight.utils";
import type { BodyView, RateDirection } from "../types/body.types";
import { rateDirection } from "../utils/body-view.utils";
import { RATE_WEEKS } from "../utils/body-weight.utils";

const ICON_SIZE = 20;
const RATE_ICONS: Record<RateDirection, IconName> = {
  up: "trending-up",
  down: "trending-down",
  same: "minus",
};

interface WeightSummaryCardProps {
  view: Pick<BodyView, "unit" | "average" | "averageCount" | "ratePerWeek">;
}

/** La media de 7 días y cuánto cambia por semana. Subir o bajar no es bueno ni malo: va en gris, con icono y texto. */
export function WeightSummaryCard({ view }: Readonly<WeightSummaryCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const locale = i18n.language;
  const { unit, average, averageCount, ratePerWeek } = view;
  if (average === null) return null;

  const direction = ratePerWeek === null ? null : rateDirection(ratePerWeek);
  const change = formatWeight({ value: Math.abs(ratePerWeek ?? 0), unit, locale });

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.summary.average")}</Text>
      <Text style={[styles.value, { color: c.text }]}>
        {formatNumber(average, locale)}
        <Text style={[styles.unit, { color: c.textSecondary }]}>{` ${unit}`}</Text>
      </Text>
      <Text style={[styles.caption, { color: c.textSecondary }]}>{t("body.summary.entries", { count: averageCount })}</Text>
      {direction ? (
        <View style={styles.rate}>
          <IconRenderer name={RATE_ICONS[direction]} size={ICON_SIZE} color={c.textSecondary} />
          <Text style={[styles.rateText, { color: c.text }]}>
            {t(`body.summary.rate.${direction}`, { value: change, weeks: RATE_WEEKS })}
          </Text>
        </View>
      ) : (
        <Text style={[styles.caption, { color: c.textSecondary }]}>{t("body.summary.noRate")}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[1], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  value: getTextStyle("displayLg"),
  unit: getTextStyle("bodySm"),
  caption: getTextStyle("bodySm"),
  rate: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2], marginTop: tokens.spacing[2] },
  rateText: { ...getTextStyle("body"), flex: 1 },
});
