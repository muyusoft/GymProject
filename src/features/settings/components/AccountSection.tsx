import { router } from "expo-router";
import { Alert, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { signOut } from "@/shared/services/session.service";
import { useSessionStore } from "@/shared/store";
import { AccountSyncStatus } from "./AccountSyncStatus";
import { SettingsSection } from "./SettingsSection";

/** Cuenta: sin sesión invita a crearla o entrar; con sesión muestra el correo y permite cerrarla. */
export function AccountSection() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const status = useSessionStore((state) => state.status);
  const email = useSessionStore((state) => state.user?.email ?? null);
  const { run, isRunning, hasError } = useActionRunner();

  const confirmSignOut = () => {
    Alert.alert(
      t("settings.account.signOutConfirm.title"),
      t("settings.account.signOutConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.account.signOut"),
          style: "destructive",
          onPress: () => void run(signOut),
        },
      ],
    );
  };

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
          <Button
            variant="secondary"
            label={t("settings.account.signOut")}
            block
            loading={isRunning}
            onPress={confirmSignOut}
          />
          {hasError && (
            <InlineError message={t("settings.account.signOutError")} />
          )}
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
  title: { ...getTextStyle("body") },
  hint: getTextStyle("bodySm"),
});
