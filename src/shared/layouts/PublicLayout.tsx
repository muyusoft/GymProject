import { ReactNode } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/design/tokens";

interface PublicLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  backgroundColor?: string;
}

/**
 * Layout para pantallas públicas (info, docs, etc)
 * - Header solo (sin footer)
 * - Scrollable content
 */
export function PublicLayout({
  children,
  header,
  backgroundColor,
}: Readonly<PublicLayoutProps>) {
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[6],
  },
  content: {
    flex: 1,
  },
});
