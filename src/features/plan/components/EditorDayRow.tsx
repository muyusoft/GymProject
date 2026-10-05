import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { DaySummary } from "../types/plan.types";

const CHEVRON_SIZE = 20;

interface EditorDayRowProps {
  day: DaySummary;
  onPress: () => void;
  onLongPress: () => void;
}

export function EditorDayRow({ day, onPress, onLongPress }: Readonly<EditorDayRowProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("weekday.long." + day.weekday)}, ${day.name}`}
      accessibilityHint={t("plan.editor.longPressHint")}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.row, { backgroundColor: c.surface }]}
    >
      <Text style={[styles.weekday, { color: c.textSecondary }]}>
        {t(`weekday.short.${day.weekday}`)}
      </Text>
      <View style={styles.texts}>
        <Text style={[styles.name, { color: c.text }]}>{day.name}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {t("plan.daySubtitle", { count: day.exerciseCount, minutes: day.durationMinutes })}
        </Text>
      </View>
      <IconRenderer name="chevron-right" size={CHEVRON_SIZE} color={c.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  weekday: { ...getTextStyle("label"), minWidth: tokens.spacing[10] },
  texts: { flex: 1 },
  name: getTextStyle("title"),
  subtitle: getTextStyle("bodySm"),
});
