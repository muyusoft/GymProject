import { ReactNode } from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface AppLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  backgroundColor?: string;
}

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
}: AppLayoutProps) {
  const { c: colors } = useOverloadTheme();

  return (
    <SafeAreaView
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
