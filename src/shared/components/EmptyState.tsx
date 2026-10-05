import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { PlateMotif } from "./PlateMotif";

interface EmptyStateProps {
  title: string;
  body?: string;
  /** Aviso bajo el texto (por ejemplo, un error). */
  children?: ReactNode;
  /** Botón de la acción principal; se muestra centrado aunque no ocupe todo el ancho. */
  action?: ReactNode;
}

/** Estado vacío de marca: los discos, qué falta y, si hay, qué hacer. El texto crece con la letra del sistema. */
export function EmptyState({
  title,
  body,
  children,
  action,
}: Readonly<EmptyStateProps>) {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.container}>
      <PlateMotif />
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: c.text }]}
      >
        {title}
      </Text>
      {!!body && (
        <Text style={[styles.body, { color: c.textSecondary }]}>{body}</Text>
      )}
      {children}
      {action !== undefined && <View style={styles.action}>{action}</View>}
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
  // Button fija alignSelf: en fila, el centrado horizontal lo decide este contenedor.
  action: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
});
