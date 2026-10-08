import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const DOT_SIZE = tokens.spacing[3];

export interface LegendItem {
  key: string;
  color: string;
  label: string;
}

interface MapLegendProps {
  items: readonly LegendItem[];
}

/** Leyenda de la figura: cada color con su nombre. */
export function MapLegend({ items }: Readonly<MapLegendProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.key} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.label, { color: c.text }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: tokens.spacing[4],
  },
  item: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: tokens.borderRadius.full,
  },
  label: getTextStyle("bodySm"),
});
