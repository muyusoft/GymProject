import { ReactNode } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface ModalLayoutProps {
  children: ReactNode;
  title?: string;
  onDismiss?: () => void;
  backgroundColor?: string;
}

/**
 * Layout para modals y bottom sheets
 * - Título opcional
 * - Dismiss button
 * - Centered content
 */
export function ModalLayout({
  children,
  title,
  onDismiss,
  backgroundColor,
}: Readonly<ModalLayoutProps>) {
  const { c: colors } = useOverloadTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || colors.surface,
        },
      ]}
    >
      {(title || onDismiss) && (
        <View
          style={[
            styles.header,
            {
              borderBottomColor: tokens.colors.neutral[200],
            },
          ]}
        >
          <View style={{ flex: 1 }} />
          {onDismiss && (
            <Pressable onPress={onDismiss} style={styles.dismissButton}>
              <View
                style={[
                  styles.dismissIcon,
                  {
                    backgroundColor: tokens.colors.neutral[300],
                  },
                ]}
              />
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
  dismissButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  dismissIcon: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[6],
  },
});
