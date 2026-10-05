import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";

const ICON_SIZE = 24;

interface ScreenHeaderProps {
  eyebrow: string;
  onBack: () => void;
  trailing?: ReactNode;
}

export function ScreenHeader({ eyebrow, onBack, trailing }: Readonly<ScreenHeaderProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
        onPress={onBack}
        style={[styles.back, { backgroundColor: c.surface }]}
      >
        <IconRenderer name="chevron-left" size={ICON_SIZE} color={c.text} />
      </Pressable>
      <Text style={[styles.eyebrow, { color: c.textSecondary }]} numberOfLines={2}>
        {eyebrow}
      </Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  back: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { ...getTextStyle("label"), flex: 1 },
});
