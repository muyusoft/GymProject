import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { AccountErrorCode } from "../types/account.types";

const ICON_SIZE = 20;

interface AccountNoticeProps {
  code: AccountErrorCode;
}

/** Aviso con icono, título y explicación de por qué no se completó una acción de cuenta. */
export function AccountNotice({ code }: Readonly<AccountNoticeProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  // "Aún no disponible" es un aviso, no un error del usuario.
  const isInfo = code === "unavailable";
  const color = isInfo ? c.info : c.danger;

  return (
    <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: c.surfaceAlt, borderColor: color }]}>
      <IconRenderer name={isInfo ? "info" : "triangle-alert"} size={ICON_SIZE} color={color} />
      <View style={styles.texts}>
        <Text style={[styles.title, { color: c.text }]}>{t(`account.errors.${code}.title`)}</Text>
        <Text style={[styles.message, { color: c.textSecondary }]}>{t(`account.errors.${code}.message`)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  texts: { flex: 1 },
  title: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  message: getTextStyle("bodySm"),
});
