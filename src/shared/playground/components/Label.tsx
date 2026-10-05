import { View, Text } from "react-native";
import { styles } from "../styles/playground.styles";
import type { LabelProps } from "../types/playground.types";

export function Label({ label, value, colors }: Readonly<LabelProps>) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textColor }]}>{label}:</Text>
      <Text style={[styles.value, { color: colors.accentColor }]}>{value}</Text>
    </View>
  );
}
