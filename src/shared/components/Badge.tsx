import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";

const ICON_SIZE = 14;

interface BadgeProps {
  label: string;
  /** "record" es el premio (ember): solo para récords y rachas. */
  tone?: "neutral" | "info" | "record";
}

export function Badge({ label, tone = "neutral" }: Readonly<BadgeProps>) {
  const { c } = useOverloadTheme();
  const colors = {
    neutral: { background: c.surfaceAlt, text: c.textSecondary },
    info: { background: c.surfaceAlt, text: c.info },
    record: { background: c.reward, text: c.surface },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      {/* El récord lleva trofeo: se reconoce sin depender solo del color. */}
      {tone === "record" && <IconRenderer name="trophy" size={ICON_SIZE} color={colors.text} />}
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[1],
    borderRadius: tokens.borderRadius.full,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[1],
  },
  label: getTextStyle("label"),
});
