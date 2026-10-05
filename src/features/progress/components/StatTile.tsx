import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { TrendDirection } from "../types/progress.types";
import { TrendBadge } from "./TrendBadge";

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  delta?: { direction: TrendDirection; text: string };
  caption?: string;
  compact?: boolean;
}

export function StatTile({ label, value, unit, delta, caption, compact = false }: Readonly<StatTileProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.tile, { backgroundColor: c.surface }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[compact ? styles.compactValue : styles.value, { color: c.text }]}>
        {value}
        {unit ? <Text style={[styles.unit, { color: c.textSecondary }]}>{` ${unit}`}</Text> : null}
      </Text>
      {delta && <TrendBadge direction={delta.direction} text={delta.text} />}
      {!!(caption) && <Text style={[styles.caption, { color: c.textSecondary }]}>{caption}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: tokens.spacing[1], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  label: getTextStyle("label"),
  value: getTextStyle("displayLg"),
  compactValue: getTextStyle("numeric"),
  unit: getTextStyle("bodySm"),
  caption: getTextStyle("bodySm"),
});
