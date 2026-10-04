import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { PlateMotif } from "./PlateMotif";

interface EmptyStateProps {
  title: string;
  body?: string;
  /** Acción o aviso bajo el texto (un botón, un error). */
  children?: ReactNode;
}

/** Estado vacío de marca: los discos, qué falta y, si hay, qué hacer. El texto crece con la letra del sistema. */
export function EmptyState({ title, body, children }: EmptyStateProps) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.container}>
      <PlateMotif />
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {title}
      </Text>
      {body && <Text style={[styles.body, { color: c.textSecondary }]}>{body}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: tokens.spacing[4],
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[6],
  },
  title: { ...getTextStyle("title"), textAlign: "center" },
  body: { ...getTextStyle("body"), textAlign: "center" },
});
