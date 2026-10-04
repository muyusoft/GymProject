import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface DemoGroupProps {
  title: string;
  children: ReactNode;
}

export function DemoGroup({ title, children }: DemoGroupProps) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.title, { color: c.textSecondary }]}>{title}</Text>
      <View style={[styles.surface, { backgroundColor: c.background }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: tokens.spacing[2], marginBottom: tokens.spacing[4] },
  title: getTextStyle("label"),
  surface: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
  },
});
