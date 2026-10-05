import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { WeightUnit } from "@/shared/types/training.types";
import { formatNumber } from "@/shared/utils/weight.utils";
import type { WeekPoint } from "../types/body.types";
import { formatDayMonth } from "../utils/body-date.utils";

const PLOT_HEIGHT = tokens.spacing[16];
const DOT_SIZE = tokens.spacing[4];
const MIDDLE = 0.5;

interface WeeklyWeightChartProps {
  /** De la semana más vieja a la actual. */
  weeks: readonly WeekPoint[];
  unit: WeightUnit;
}

/** Un punto por semana con su media; las semanas sin registros quedan vacías, con una raya en lugar del número. */
export function WeeklyWeightChart({ weeks, unit }: Readonly<WeeklyWeightChartProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const values = weeks.flatMap((week) => (week.value === null ? [] : [week.value]));
  const min = Math.min(...values);
  const range = Math.max(...values) - min;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("body.chart.title")}</Text>
        <Text style={[styles.label, { color: c.textSecondary }]}>{unit}</Text>
      </View>
      <View style={styles.plot}>
        {weeks.map(({ end, value }) => {
          const height = value === null || range === 0 ? MIDDLE : (value - min) / range;
          return (
            <View key={end} style={styles.column}>
              <View style={[styles.track, { height: PLOT_HEIGHT }]}>
                {value !== null && (
                  <View style={[styles.dot, { backgroundColor: c.accentText, bottom: height * (PLOT_HEIGHT - DOT_SIZE) }]} />
                )}
              </View>
              <Text style={[styles.value, { color: c.text }]}>
                {value === null ? t("body.chart.none") : formatNumber(value, i18n.language)}
              </Text>
              <Text style={[styles.date, { color: c.textSecondary }]}>{formatDayMonth(end, i18n.language)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: getTextStyle("label"),
  plot: { flexDirection: "row", alignItems: "flex-end" },
  column: { flex: 1, alignItems: "center", gap: tokens.spacing[1] },
  track: { width: "100%", alignItems: "center" },
  dot: { position: "absolute", width: DOT_SIZE, height: DOT_SIZE, borderRadius: tokens.borderRadius.full },
  value: getTextStyle("title"),
  date: getTextStyle("bodySm"),
});
