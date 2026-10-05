import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { IconName } from "@/shared/icons";
import IconRenderer from "@/shared/icons/icon-renderer";
import {
  getButtonColors,
  isButtonInert,
  type ButtonVariant,
} from "@/shared/utils/button.utils";

const ICON_SIZE = 20;
const PRESSED_OPACITY = 0.85;
const DISABLED_OPACITY = 0.4;

interface ButtonProps {
  variant?: ButtonVariant;
  label: string;
  icon?: IconName;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function Button({
  variant = "primary",
  label,
  icon,
  block = false,
  loading = false,
  disabled = false,
  onPress,
}: Readonly<ButtonProps>) {
  const { c } = useOverloadTheme();
  const colors = getButtonColors(variant, c);
  const isInert = isButtonInert(disabled, loading);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInert, busy: loading }}
      disabled={isInert}
      onPress={onPress}
      style={({ pressed }) => {
        let opacity = 1;

        if (disabled) {
          opacity = DISABLED_OPACITY;
        } else if (pressed) {
          opacity = PRESSED_OPACITY;
        }

        return [
          styles.base,
          block ? styles.block : styles.inline,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            opacity,
          },
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : (
        <>
          {icon && (
            <IconRenderer name={icon} size={ICON_SIZE} color={colors.foreground} />
          )}
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: tokens.spacing[6],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[2],
  },
  block: { alignSelf: "stretch" },
  inline: { alignSelf: "flex-start" },
  label: {
    ...getTextStyle("body"),
    fontFamily: tokens.typography.fontFamily.sansSemibold,
  },
});
