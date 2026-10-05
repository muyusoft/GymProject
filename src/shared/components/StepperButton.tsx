import { Pressable, StyleSheet } from "react-native";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { IconName } from "@/shared/icons";
import IconRenderer from "@/shared/icons/icon-renderer";

const ICON_SIZE = 24;
const DISABLED_OPACITY = 0.4;

interface StepperButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  isDisabled: boolean;
  onPress: () => void;
}

export function StepperButton({
  icon,
  accessibilityLabel,
  isDisabled,
  onPress,
}: Readonly<StepperButtonProps>) {
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: c.surfaceAlt,
          opacity: isDisabled ? DISABLED_OPACITY : 1,
        },
      ]}
    >
      <IconRenderer name={icon} size={ICON_SIZE} color={c.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
