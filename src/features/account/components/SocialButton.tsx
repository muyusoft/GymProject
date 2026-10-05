import { Pressable, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import type { SocialProvider } from "../types/account.types";

const LOGO_SIZE = 20;
const PRESSED_OPACITY = 0.85;
const DISABLED_OPACITY = 0.4;
/** Las guías de Apple y Google piden la letra del sistema en peso medio, no la tipografía de la app. */
const BRAND_FONT_WEIGHT = "500";
const LOGO_BY_PROVIDER = { apple: "brand-apple", google: "brand-google" } as const;

interface SocialButtonProps {
  provider: SocialProvider;
  disabled?: boolean;
  onPress: () => void;
}

/** Botón oficial de "Continuar con Apple / Google": logotipo, texto completo y colores de marca. */
export function SocialButton({ provider, disabled = false, onPress }: Readonly<SocialButtonProps>) {
  const { t } = useTranslation();
  const { mode } = useOverloadTheme();
  const colors = tokens.brand[mode][provider];
  const label = t(`account.social.${provider}`);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background, borderColor: colors.border },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <IconRenderer name={LOGO_BY_PROVIDER[provider]} size={LOGO_SIZE} color={colors.foreground} />
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  disabled: { opacity: DISABLED_OPACITY },
  pressed: { opacity: PRESSED_OPACITY },
  label: { fontSize: tokens.typography.fontSize.lg, fontWeight: BRAND_FONT_WEIGHT },
});
