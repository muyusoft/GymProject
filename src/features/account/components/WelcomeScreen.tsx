import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTextStyle, tokens } from "@/design/tokens";
import { LogoMark } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { AccountLink } from "./AccountLink";
import { WelcomeActions } from "./WelcomeActions";
import { WelcomePreview } from "./WelcomePreview";

const LOGO_SIZE = tokens.spacing[8];

/** Bienvenida: qué es la app, entrar sin cuenta y, como opción, guardar el progreso en la nube. */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  // El panel llega hasta el borde de la pantalla; su contenido se detiene antes de la línea de inicio.
  const { bottom } = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <View style={styles.bar}>
          <View style={styles.brand}>
            <LogoMark size={LOGO_SIZE} />
            <Text style={[styles.brandName, { color: c.text }]}>
              {t("account.brand")}
            </Text>
          </View>
          <AccountLink
            label={t("account.welcome.haveAccount")}
            onPress={() => router.push("/account/sign-in")}
          />
        </View>
        <WelcomePreview />
      </View>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: c.surface,
            paddingBottom: tokens.spacing[6] + bottom,
          },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: c.text }]}
        >
          {t("account.welcome.title")}
        </Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {t("account.welcome.body")}
        </Text>
        <WelcomeActions />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  top: { gap: tokens.spacing[3], padding: tokens.dimensions.screenGutter },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[3],
  },
  brand: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  brandName: {
    ...getTextStyle("numeric"),
    fontFamily: tokens.typography.fontFamily.display,
    textTransform: "uppercase",
  },
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
