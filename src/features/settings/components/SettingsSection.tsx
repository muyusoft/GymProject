import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: Readonly<SettingsSectionProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing[2] },
  title: getTextStyle("label"),
  card: {
    gap: tokens.spacing[4],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
});
