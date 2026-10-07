import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useAccountAction } from "../hooks/use-account-action";
import { useStartApp } from "../hooks/use-start-app";
import { signInWithProvider } from "../services/account.service";
import {
  AVAILABLE_PROVIDERS,
  type SocialProvider,
} from "../types/account.types";
import { AccountLink } from "./AccountLink";
import { AccountNotice } from "./AccountNotice";
import { LabeledDivider } from "./LabeledDivider";
import { SocialButton } from "./SocialButton";

/** Acciones de la bienvenida: "Empezar" sin cuenta como principal y la cuenta como opción. */
export function WelcomeActions() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const app = useStartApp();
  const account = useAccountAction();

  const signInWith = (provider: SocialProvider) => {
    void account
      .run(() => signInWithProvider(provider))
      .then((isSignedIn) => {
        if (isSignedIn) app.start();
      });
  };

  return (
    <View style={styles.actions}>
      <Button
        label={t("account.welcome.start")}
        block
        loading={app.isStarting}
        onPress={app.start}
      />
      {app.hasError && <InlineError message={t("common.saveError")} />}
      <LabeledDivider label={t("account.welcome.orCloud")} />
      {account.errorCode !== null && <AccountNotice code={account.errorCode} />}
      {AVAILABLE_PROVIDERS.map((provider) => (
        <SocialButton
          key={provider}
          provider={provider}
          disabled={account.isRunning}
          onPress={() => signInWith(provider)}
        />
      ))}
      <AccountLink
        label={t("account.welcome.withEmail")}
        onPress={() => router.push("/account/sign-up")}
      />
      <Text style={[styles.legal, { color: c.textSecondary }]}>
        {t("account.welcome.legal")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: tokens.spacing[3] },
  legal: { ...getTextStyle("bodySm"), textAlign: "center" },
});
