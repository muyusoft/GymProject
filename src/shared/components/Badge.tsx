import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface BadgeProps {
  label: string;
  /** "record" es el premio (ember): solo para récords y rachas. */
  tone?: "neutral" | "info" | "record";
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const { c } = useOverloadTheme();
  const colors = {
    neutral: { background: c.surfaceAlt, text: c.textSecondary },
    info: { background: c.surfaceAlt, text: c.info },
    record: { background: c.reward, text: c.surface },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: tokens.borderRadius.full,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[1],
  },
  label: getTextStyle("label"),
});
