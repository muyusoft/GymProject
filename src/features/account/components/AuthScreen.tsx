import { router } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface AuthScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Enlace al pie: "¿No tienes cuenta? Crear cuenta". */
  footer?: ReactNode;
}

/** Marco común de las pantallas de cuenta: volver, título, formulario con scroll y pie. */
export function AuthScreen({ title, subtitle, children, footer }: Readonly<AuthScreenProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <KeyboardAvoidingView style={styles.screen} {...(Platform.OS === "ios" && { behavior: "padding" as const })}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow={t("account.eyebrow")} onBack={() => router.back()} />
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
        </View>
        {children}
        {footer !== undefined && <View style={styles.footer}>{footer}</View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: tokens.spacing[4],
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[8],
  },
  heading: { gap: tokens.spacing[2] },
  title: getTextStyle("displayLg"),
  subtitle: getTextStyle("body"),
  footer: { flexGrow: 1, justifyContent: "flex-end" },
});
