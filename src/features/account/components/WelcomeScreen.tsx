import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { PlateMotif } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { AccountLink } from "./AccountLink";
import { WelcomeActions } from "./WelcomeActions";
import { WelcomePreview } from "./WelcomePreview";

/** Bienvenida: qué es la app, entrar sin cuenta y, como opción, guardar el progreso en la nube. */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.bar}>
          <View style={styles.brand}>
            <PlateMotif />
            <Text style={[styles.brandName, { color: c.text }]}>{t("account.brand")}</Text>
          </View>
          <AccountLink label={t("account.welcome.haveAccount")} onPress={() => router.push("/account/sign-in")} />
        </View>
        <WelcomePreview />
      </View>
      <View style={[styles.panel, { backgroundColor: c.surface }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t("account.welcome.title")}
        </Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>{t("account.welcome.body")}</Text>
        <WelcomeActions />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  top: { gap: tokens.spacing[3], padding: tokens.dimensions.screenGutter },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[3] },
  brand: { flexDirection: "row", alignItems: "flex-end", gap: tokens.spacing[2] },
  brandName: getTextStyle("numeric"),
  panel: {
    flexGrow: 1,
    gap: tokens.spacing[3],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  title: getTextStyle("displayLg"),
  body: getTextStyle("body"),
});
