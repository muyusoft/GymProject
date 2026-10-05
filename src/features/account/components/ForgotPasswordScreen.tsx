import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components";
import { useAccountAction } from "../hooks/use-account-action";
import { requestPasswordReset } from "../services/account.service";
import { isEmailValid, shouldFlagEmail } from "../utils/account-validation.utils";
import { AccountLink } from "./AccountLink";
import { AccountNotice } from "./AccountNotice";
import { AccountTextField } from "./AccountTextField";
import { AuthScreen } from "./AuthScreen";

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const account = useAccountAction();

  const submit = () => {
    const address = email.trim();
    void account.run(() => requestPasswordReset(address)).then((isSent) => {
      if (isSent) router.push({ pathname: "/account/check-email", params: { email: address } });
    });
  };

  return (
    <AuthScreen
      title={t("account.forgot.title")}
      subtitle={t("account.forgot.subtitle")}
      footer={
        <AccountLink
          prefix={t("account.forgot.remembered")}
          label={t("account.forgot.backToSignIn")}
          onPress={() => router.back()}
        />
      }
    >
      {account.errorCode !== null && <AccountNotice code={account.errorCode} />}
      <AccountTextField
        kind="email"
        label={t("account.forgot.emailLabel")}
        value={email}
        onChange={setEmail}
        placeholder={t("account.fields.emailPlaceholder")}
        {...(shouldFlagEmail(email) && { error: t("account.fields.emailInvalid") })}
      />
      <Button
        label={t("account.forgot.submit")}
        block
        loading={account.isRunning}
        disabled={!isEmailValid(email)}
        onPress={submit}
      />
    </AuthScreen>
  );
}
