import { StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const BAR_HEIGHTS = [
  tokens.spacing[4],
  tokens.spacing[6],
  tokens.spacing[8],
  tokens.spacing[10],
  tokens.spacing[12],
] as const;
const BAR_WIDTH = tokens.spacing[3];

/** Marca de Overload: discos de pesas, barras redondeadas de alturas crecientes. Es decoración pura. */
export function PlateMotif() {
  const { c } = useOverloadTheme();

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.row}>
      {BAR_HEIGHTS.map((height, index) => (
        <View
          key={height}
          style={[
            styles.bar,
            { height, backgroundColor: index === BAR_HEIGHTS.length - 1 ? c.accentText : c.surfaceAlt },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: tokens.spacing[1] },
  bar: { width: BAR_WIDTH, borderRadius: tokens.borderRadius.full },
});
