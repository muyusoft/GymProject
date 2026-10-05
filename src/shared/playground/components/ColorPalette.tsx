import { View, Text } from "react-native";
import { tokens } from "@/design/tokens";
import { styles } from "../styles/playground.styles";
import type { ColorPaletteProps } from "../types/playground.types";

export function ColorPalette({ name, colors, textColor }: Readonly<ColorPaletteProps>) {
  return (
    <View style={styles.paletteSection}>
      <Text style={[styles.paletteName, { color: textColor }]}>{name}</Text>
      <View style={styles.colorGrid}>
        {Object.entries(colors).map(([key, value]) => (
          <View key={key} style={styles.colorBox}>
            <View style={[styles.colorSwatch, { backgroundColor: value }]} />
            <Text
              style={[
                styles.colorLabel,
                {
                  color: textColor,
                  fontSize: tokens.typography.fontSize.xs,
                },
              ]}
            >
              {key}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
