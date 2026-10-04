import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const CHART_HEIGHT = tokens.spacing[16] * 2;
const EMPTY_BAR_HEIGHT = tokens.spacing[1];

export interface ChartBar {
  /** Identifica el periodo (su fecha de inicio). */
  key: string;
  /** null = sin sesión en ese periodo. */
  value: number | null;
}

interface BarChartProps {
  bars: readonly ChartBar[];
  labels: { start: string; middle: string; end: string };
  accessibilityLabel: string;
}

/** Barras del 1RM por periodo; la última con dato va en volt y las demás en gris. */
export function BarChart({ bars, labels, accessibilityLabel }: Readonly<BarChartProps>) {
  const { c } = useOverloadTheme();
  const max = Math.max(...bars.map((bar) => bar.value ?? 0), 0);
  const lastKey = bars.reduce<string | null>((last, bar) => (bar.value === null ? last : bar.key), null);

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={styles.bars}>
        {bars.map(({ key, value }) => (
          <View
            key={key}
            style={[
              styles.bar,
              {
                height: value === null || max === 0 ? EMPTY_BAR_HEIGHT : Math.max(EMPTY_BAR_HEIGHT, (value / max) * CHART_HEIGHT),
                backgroundColor: key === lastKey ? c.accentText : c.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.axis}>
        {(["start", "middle", "end"] as const).map((position) => (
          <Text key={position} style={[styles.axisLabel, { color: c.textSecondary }]}>
            {labels[position]}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: tokens.spacing[1] },
  bar: { flex: 1, borderRadius: tokens.borderRadius.sm },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: tokens.spacing[2] },
  axisLabel: getTextStyle("bodySm"),
});
