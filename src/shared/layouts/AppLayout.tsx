import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface AppLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  backgroundColor?: string;
  /**
   * Lados en los que se deja el margen seguro (muesca, barra de estado, barra de gestos). Por defecto los
   * cuatro. Las pantallas de pestañas pasan `EDGES_WITHOUT_BOTTOM`: abajo ya está la barra de pestañas.
   */
  edges?: readonly Edge[];
}

const ALL_EDGES: readonly Edge[] = ["top", "right", "bottom", "left"];

/**
 * Layout principal para pantallas de la app autenticada
 * - SafeArea (notches, home indicator)
 * - Header opcional
 * - Content scrollable
 * - Footer opcional (sticky)
 */
export function AppLayout({
  children,
  header,
  footer,
  backgroundColor,
  edges = ALL_EDGES,
}: Readonly<AppLayoutProps>) {
  const { c: colors } = useOverloadTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.background },
      ]}
    >
      {header && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {header}
        </View>
      )}

      <View style={styles.content}>{children}</View>

      {footer && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {footer}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
});
