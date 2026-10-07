import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSessionStore } from "@/shared/store";
import { AccountSyncStatus } from "./AccountSyncStatus";
import { SettingsSection } from "./SettingsSection";

/**
 * Cuenta, al inicio de Perfil: sin sesión invita a crearla o entrar; con sesión muestra quién eres y el
 * estado de la copia en la nube. Cerrar sesión va aparte, al final de la pantalla (`SignOutButton`).
 */
export function AccountSection() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const status = useSessionStore((state) => state.status);
  const email = useSessionStore((state) => state.user?.email ?? null);

  if (status === "loading") return null;

  return (
    <SettingsSection title={t("settings.sections.account")}>
      {status === "signedIn" ? (
        <>
          <Text style={[styles.title, { color: c.text }]}>
            {email
              ? t("settings.account.signedInAs", { email })
              : t("settings.account.signedIn")}
          </Text>
          <AccountSyncStatus />
        </>
      ) : (
        <>
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            {t("settings.account.signedOutHint")}
          </Text>
          <Button
            variant="secondary"
            label={t("settings.account.signIn")}
            icon="user"
            block
            onPress={() => router.push("/account/sign-in")}
          />
        </>
      )}
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  title: getTextStyle("body"),
  hint: getTextStyle("bodySm"),
});
