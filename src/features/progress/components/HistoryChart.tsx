import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { WeightUnit } from "@/shared/types/training.types";
import { convertWeight, formatNumber } from "@/shared/utils/weight.utils";
import type { ExerciseSession } from "../types/progress.types";
import { formatShortDate } from "../utils/date-format.utils";
import { MIN_TREND_SESSIONS } from "../utils/history-stats.utils";

const PLOT_HEIGHT = tokens.spacing[16];
const DOT_SIZE = tokens.spacing[4];
const MAX_POINTS = 6;

interface HistoryChartProps {
  /** De la sesión más nueva a la más vieja. */
  sessions: readonly ExerciseSession[];
  unit: WeightUnit;
}

/** Peso por sesión: un punto por sesión (las últimas 6). La tendencia aparece desde la 4.ª sesión. */
export function HistoryChart({ sessions, unit }: Readonly<HistoryChartProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const points = sessions
    .slice(0, MAX_POINTS)
    .reverse()
    .map((session) => ({ session, weight: convertWeight(session.best.weight, session.best.unit, unit) }));
  const weights = points.map((point) => point.weight);
  const min = Math.min(...weights);
  const range = Math.max(...weights) - min;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{t("history.chart.title")}</Text>
        <Text style={[styles.label, { color: c.textSecondary }]}>{unit}</Text>
      </View>
      <View style={styles.plot}>
        {points.map(({ session, weight }) => {
          const height = range === 0 ? 0.5 : (weight - min) / range;
          return (
            <View key={session.sessionId} style={styles.column}>
              <View style={[styles.track, { height: PLOT_HEIGHT }]}>
                <View style={[styles.dot, { backgroundColor: c.accentText, bottom: height * (PLOT_HEIGHT - DOT_SIZE) }]} />
              </View>
              <Text style={[styles.weight, { color: c.text }]}>{formatNumber(weight, i18n.language)}</Text>
              <Text style={[styles.date, { color: c.textSecondary }]}>{formatShortDate(session.date, i18n.language)}</Text>
            </View>
          );
        })}
      </View>
      {sessions.length < MIN_TREND_SESSIONS && (
        <Text style={[styles.note, { color: c.textSecondary }]}>{t("history.chart.noTrend", { count: MIN_TREND_SESSIONS })}</Text>
      )}
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
  weight: getTextStyle("title"),
  date: getTextStyle("bodySm"),
  note: { ...getTextStyle("bodySm"), textAlign: "center" },
});
