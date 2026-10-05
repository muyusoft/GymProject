import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";

const HANDLE_SIZE = 20;

interface ListRowProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  hasDragHandle?: boolean;
  isDragging?: boolean;
}

export function ListRow({
  title,
  subtitle,
  trailing,
  onPress,
  hasDragHandle = false,
  isDragging = false,
}: Readonly<ListRowProps>) {
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={title}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: isDragging ? c.surfaceAlt : c.surface,
          borderColor: isDragging ? c.textSecondary : c.border,
        },
      ]}
    >
      {hasDragHandle && (
        <IconRenderer
          name="grip-vertical"
          size={HANDLE_SIZE}
          color={c.textSecondary}
        />
      )}
      <View style={styles.texts}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {!!(subtitle) && (
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
  },
  texts: { flex: 1 },
  title: getTextStyle("body"),
  subtitle: getTextStyle("bodySm"),
});
