import { ReactNode } from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { tokens } from "@/design/tokens";

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
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || tokens.colors.neutral[50],
        },
      ]}
    >
      {header && <View style={styles.header}>{header}</View>}

      <View style={styles.content}>{children}</View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.neutral[200],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
});
