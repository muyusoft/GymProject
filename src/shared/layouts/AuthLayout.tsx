import { ReactNode } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/design/tokens";

interface AuthLayoutProps {
  children: ReactNode;
  backgroundColor?: string;
}

/**
 * Layout para pantallas de autenticación
 * - Centered content
 * - Scrollable para formas largas
 * - Sin header/footer
 */
export function AuthLayout({
  children,
  backgroundColor,
}: Readonly<AuthLayoutProps>) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || tokens.colors.neutral[50],
        },
      ]}
    >
      <ScrollView
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[8],
  },
});
