import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components";
import { useAccountAction } from "../hooks/use-account-action";
import { useStartApp } from "../hooks/use-start-app";
import { signIn, signInWithProvider } from "../services/account.service";
import { SOCIAL_PROVIDERS } from "../types/account.types";
import { canSignIn, shouldFlagEmail } from "../utils/account-validation.utils";
import { AccountLink } from "./AccountLink";
import { AccountNotice } from "./AccountNotice";
import { AccountTextField } from "./AccountTextField";
import { AuthScreen } from "./AuthScreen";
import { LabeledDivider } from "./LabeledDivider";
import { SocialButton } from "./SocialButton";

export function SignInScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const account = useAccountAction();
  const app = useStartApp();

  const submit = (action: () => Promise<void>) => {
    void account.run(action).then((isSignedIn) => {
      if (isSignedIn) app.start();
    });
  };

  return (
    <AuthScreen
      title={t("account.signIn.title")}
      subtitle={t("account.signIn.subtitle")}
      footer={
        <AccountLink
          prefix={t("account.signIn.noAccount")}
          label={t("account.signIn.create")}
          onPress={() => router.replace("/account/sign-up")}
        />
      }
    >
      {SOCIAL_PROVIDERS.map((provider) => (
        <SocialButton
          key={provider}
          provider={provider}
          disabled={account.isRunning}
          onPress={() => submit(() => signInWithProvider(provider))}
        />
      ))}
      <LabeledDivider label={t("account.signIn.orEmail")} />
      {account.errorCode !== null && <AccountNotice code={account.errorCode} />}
      <AccountTextField
        kind="email"
        label={t("account.fields.email")}
        value={email}
        onChange={setEmail}
        placeholder={t("account.fields.emailPlaceholder")}
        {...(shouldFlagEmail(email) && { error: t("account.fields.emailInvalid") })}
      />
      <AccountTextField
        kind="password"
        label={t("account.fields.password")}
        value={password}
        onChange={setPassword}
        placeholder={t("account.fields.passwordPlaceholder")}
        {...(account.errorCode === "invalid_credentials" && { error: t("account.signIn.wrongPassword") })}
      />
      <AccountLink
        label={t("account.signIn.forgot")}
        align="flex-end"
        onPress={() => router.push("/account/forgot-password")}
      />
      <Button
        label={t("account.signIn.submit")}
        block
        loading={account.isRunning || app.isStarting}
        disabled={!canSignIn({ email, password })}
        onPress={() => submit(() => signIn({ email: email.trim(), password }))}
      />
    </AuthScreen>
  );
}
