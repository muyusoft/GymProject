import { Linking, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { formatClock } from "@/shared/utils/duration.utils";
import { useAccountAction } from "../hooks/use-account-action";
import { useCountdown } from "../hooks/use-countdown";
import { requestPasswordReset } from "../services/account.service";
import { AccountNotice } from "./AccountNotice";
import { AuthScreen } from "./AuthScreen";

const RESEND_SECONDS = 45;
const MAIL_APP_URL = "mailto:";
const MAIL_ICON_SIZE = 32;
const TIPS = ["tipSpam", "tipTypo"] as const;

interface CheckEmailScreenProps {
  email: string;
}

/** Tras pedir el enlace de recuperación: dónde buscarlo, abrir el correo y reenviarlo tras una espera. */
export function CheckEmailScreen({ email }: Readonly<CheckEmailScreenProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const mailApp = useActionRunner();
  const account = useAccountAction();
  const countdown = useCountdown(RESEND_SECONDS);

  const resend = () => {
    void account.run(() => requestPasswordReset(email)).then(countdown.restart);
  };

  return (
    <AuthScreen title={t("account.checkEmail.title")} subtitle={t("account.checkEmail.body", { email })}>
      <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
        <IconRenderer name="mail" size={MAIL_ICON_SIZE} color={c.text} />
      </View>
      <View style={[styles.tips, { backgroundColor: c.surface }]}>
        {TIPS.map((tip) => (
          <Text key={tip} style={[styles.tip, { color: c.textSecondary }]}>
            {t(`account.checkEmail.${tip}`)}
          </Text>
        ))}
      </View>
      {account.errorCode !== null && <AccountNotice code={account.errorCode} />}
      <Button
        label={t("account.checkEmail.openMail")}
        block
        onPress={() => void mailApp.run(() => Linking.openURL(MAIL_APP_URL))}
      />
      {mailApp.hasError && <InlineError message={t("account.checkEmail.openMailError")} />}
      <Button
        variant="ghost"
        block
        loading={account.isRunning}
        disabled={!countdown.isDone}
        label={
          countdown.isDone
            ? t("account.checkEmail.resend")
            : t("account.checkEmail.resendIn", { time: formatClock(countdown.secondsLeft) })
        }
        onPress={resend}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: "flex-start",
    width: tokens.spacing[16],
    height: tokens.spacing[16],
    borderRadius: tokens.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  tips: { gap: tokens.spacing[2], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg },
  tip: getTextStyle("bodySm"),
});
