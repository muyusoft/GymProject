import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { formatNumber } from "@/shared/utils/weight.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import { formatAxisLabel } from "../utils/date-format.utils";
import type { FeaturedView } from "../utils/progress-view.utils";
import { BarChart } from "./BarChart";
import { TrendBadge } from "./TrendBadge";

interface OneRepMaxCardProps {
  featured: FeaturedView;
}

export function OneRepMaxCard({ featured }: Readonly<OneRepMaxCardProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { bucketStarts, spanUnit, trend, current } = featured;
  const locale = i18n.language;
  const name = getExerciseName(featured, locale);
  const value = current === null ? "—" : formatNumber(current, locale);

  const labels = {
    start: formatAxisLabel(bucketStarts[0] ?? new Date(), spanUnit, locale),
    middle: formatAxisLabel(bucketStarts[Math.floor(bucketStarts.length / 2)] ?? new Date(), spanUnit, locale),
    end: t("progress.today"),
  };
  const bars = featured.bars.map((barValue, index) => ({
    key: toIsoDate(bucketStarts[index] ?? new Date(0)),
    value: barValue,
  }));

  const trendText = trend
    ? t(`progress.delta.${trend.direction}`, {
        value: `${formatNumber(Math.abs(trend.delta), locale)} ${featured.unit}`,
        span: t(`progress.span.${spanUnit}`, { count: featured.span }),
      })
    : null;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: c.textSecondary }]} numberOfLines={2}>
          {t("progress.oneRepMax", { name })}
        </Text>
        {featured.isRecord && <Badge label={t("progress.record")} tone="record" />}
      </View>
      <Text style={[styles.value, { color: c.text }]}>
        {value}
        <Text style={[styles.unit, { color: c.textSecondary }]}>{` ${featured.unit}`}</Text>
      </Text>
      {trend && !!(trendText) && <TrendBadge direction={trend.direction} text={trendText} />}
      <BarChart
        bars={bars}
        labels={labels}
        accessibilityLabel={t("progress.chartLabel", { name, value, unit: featured.unit })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: tokens.spacing[3] },
  eyebrow: { ...getTextStyle("label"), flex: 1 },
  value: getTextStyle("displayLg"),
  unit: getTextStyle("body"),
});
