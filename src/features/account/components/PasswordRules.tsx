import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { PasswordChecks } from "../types/account.types";
import { MIN_PASSWORD_LENGTH } from "../utils/account-validation.utils";

const ICON_SIZE = 16;

interface PasswordRulesProps {
  checks: PasswordChecks;
}

function Rule({ label, isMet }: Readonly<{ label: string; isMet: boolean }>) {
  const { c } = useOverloadTheme();

  return (
    <View accessible accessibilityState={{ checked: isMet }} style={styles.rule}>
      <IconRenderer name={isMet ? "check" : "minus"} size={ICON_SIZE} color={isMet ? c.text : c.textSecondary} />
      <Text style={[styles.label, { color: isMet ? c.text : c.textSecondary }]}>{label}</Text>
    </View>
  );
}

/** Requisitos de la contraseña nueva; cada uno cambia de icono (no solo de color) al cumplirse. */
export function PasswordRules({ checks }: Readonly<PasswordRulesProps>) {
  const { t } = useTranslation();

  return (
    <View accessibilityLabel={t("account.signUp.rulesLabel")} style={styles.rules}>
      <Rule label={t("account.signUp.rules.minLength", { length: MIN_PASSWORD_LENGTH })} isMet={checks.hasMinLength} />
      <Rule label={t("account.signUp.rules.letterAndNumber")} isMet={checks.hasLetterAndNumber} />
    </View>
  );
}

const styles = StyleSheet.create({
  rules: { gap: tokens.spacing[1] },
  rule: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  label: { ...getTextStyle("bodySm"), flex: 1 },
});
