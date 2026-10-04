import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { IconName } from "@/shared/icons";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { ReorderDirection } from "../types/plan.types";

const ICON_SIZE = 20;
const DISABLED_OPACITY = 0.3;

interface ReorderButtonsProps {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: ReorderDirection) => void;
}

export function ReorderButtons({ canMoveUp, canMoveDown, onMove }: ReorderButtonsProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  const renderButton = (direction: ReorderDirection, icon: IconName, isEnabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(direction === "up" ? "plan.day.moveUp" : "plan.day.moveDown")}
      accessibilityState={{ disabled: !isEnabled }}
      disabled={!isEnabled}
      onPress={() => onMove(direction)}
      style={[styles.button, { opacity: isEnabled ? 1 : DISABLED_OPACITY }]}
    >
      <IconRenderer name={icon} size={ICON_SIZE} color={c.textSecondary} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {renderButton("up", "arrow-up", canMoveUp)}
      {renderButton("down", "arrow-down", canMoveDown)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  button: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
