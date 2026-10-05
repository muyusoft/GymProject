import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface LabeledDividerProps {
  label: string;
}

export function LabeledDivider({ label }: Readonly<LabeledDividerProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: c.divider }]} />
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: c.divider }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  label: { ...getTextStyle("label"), flexShrink: 1, textAlign: "center" },
});
