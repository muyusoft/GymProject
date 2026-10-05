import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { formatWeight } from "@/shared/utils/weight.utils";
import { IntroCard } from "./IntroCard";

const SAMPLE_STREAK_DAYS = 9;
const SAMPLE_WEIGHT_KG = 72.4;
const SAMPLE_WEEKLY_LOSS_KG = 0.3;
const ICON_SIZE = 16;
/** Tres semanas de ejemplo, de lunes a domingo: true = día entrenado. */
const SAMPLE_WEEKS = [
  { id: "week-1", days: [true, true, false, true, true, false, false] },
  { id: "week-2", days: [true, true, true, false, true, false, false] },
  { id: "week-3", days: [true, true, false, true, false, false, false] },
] as const;
const WEEKDAY_IDS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function ConsistencyGrid() {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.grid}>
      {SAMPLE_WEEKS.map((week) => (
        <View key={week.id} style={styles.week}>
          {WEEKDAY_IDS.map((weekday, position) => (
            <View key={weekday} style={[styles.cell, { backgroundColor: c.surfaceAlt }]}>
              {week.days[position] === true && <IconRenderer name="check" size={ICON_SIZE} color={c.text} />}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Ilustración del paso 5: calendario de constancia con la racha y el peso corporal con su tendencia. */
export function IntroBodyArt() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const locale = i18n.language;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t("intro.art.body")} style={styles.art}>
      <IntroCard>
        <View style={styles.header}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("intro.samples.consistency")}</Text>
          <View style={styles.streak}>
            <IconRenderer name="flame" size={ICON_SIZE} color={c.reward} />
            <Text style={[styles.streakLabel, { color: c.reward }]}>
              {t("intro.samples.streak", { count: SAMPLE_STREAK_DAYS })}
            </Text>
          </View>
        </View>
        <ConsistencyGrid />
        <View style={styles.legend}>
          <IconRenderer name="check" size={ICON_SIZE} color={c.text} />
          <Text style={[styles.legendLabel, { color: c.textSecondary }]}>{t("intro.samples.trained")}</Text>
        </View>
      </IntroCard>
      <IntroCard>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("intro.samples.bodyWeight")}</Text>
        <View style={styles.header}>
          <Text style={[styles.weight, { color: c.text }]}>
            {formatWeight({ value: SAMPLE_WEIGHT_KG, unit: "kg", locale })}
          </Text>
          <Text style={[styles.trend, { color: c.textSecondary }]}>
            {t("intro.samples.weeklyChange", {
              weight: formatWeight({ value: SAMPLE_WEEKLY_LOSS_KG, unit: "kg", locale }),
            })}
          </Text>
        </View>
      </IntroCard>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { gap: tokens.spacing[3] },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[3] },
  label: getTextStyle("label"),
  streak: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[1] },
  streakLabel: { ...getTextStyle("bodySm"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  grid: { gap: tokens.spacing[1] },
  week: { flexDirection: "row", gap: tokens.spacing[1] },
  cell: {
    flex: 1,
    minHeight: tokens.spacing[8],
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  legendLabel: getTextStyle("bodySm"),
  weight: getTextStyle("numeric"),
  trend: { ...getTextStyle("bodySm"), flex: 1, textAlign: "right" },
});
