import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, Toggle } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { useAccountAction } from "../hooks/use-account-action";
import { useStartApp } from "../hooks/use-start-app";
import { signUp } from "../services/account.service";
import { canSignUp, checkPassword, shouldFlagEmail } from "../utils/account-validation.utils";
import { AccountLink } from "./AccountLink";
import { AccountNotice } from "./AccountNotice";
import { AccountTextField } from "./AccountTextField";
import { AuthScreen } from "./AuthScreen";
import { PasswordRules } from "./PasswordRules";

const ICON_SIZE = 20;

export function SignUpScreen() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const account = useAccountAction();
  const app = useStartApp();

  const submit = () => {
    void account.run(() => signUp({ name: name.trim(), email: email.trim(), password })).then((isCreated) => {
      if (isCreated) app.start();
    });
  };

  return (
    <AuthScreen
      title={t("account.signUp.title")}
      subtitle={t("account.signUp.subtitle")}
      footer={
        <AccountLink
          prefix={t("account.signUp.haveAccount")}
          label={t("account.signUp.signIn")}
          onPress={() => router.replace("/account/sign-in")}
        />
      }
    >
      {account.errorCode !== null && <AccountNotice code={account.errorCode} />}
      <AccountTextField kind="name" label={t("account.fields.name")} value={name} onChange={setName} />
      <AccountTextField
        kind="email"
        label={t("account.fields.email")}
        value={email}
        onChange={setEmail}
        placeholder={t("account.fields.emailPlaceholder")}
        {...(shouldFlagEmail(email) && { error: t("account.fields.emailInvalid") })}
      />
      <AccountTextField kind="newPassword" label={t("account.fields.password")} value={password} onChange={setPassword} />
      <PasswordRules checks={checkPassword(password)} />
      <Toggle value={hasAcceptedTerms} onChange={setHasAcceptedTerms} label={t("account.signUp.terms")} />
      <Button
        label={t("account.signUp.submit")}
        block
        loading={account.isRunning || app.isStarting}
        disabled={!canSignUp({ name, email, password, hasAcceptedTerms })}
        onPress={submit}
      />
      <View style={styles.note}>
        <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
        <Text style={[styles.noteText, { color: c.textSecondary }]}>{t("account.signUp.uploadNote")}</Text>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: "row", gap: tokens.spacing[2] },
  noteText: { ...getTextStyle("bodySm"), flex: 1 },
});
