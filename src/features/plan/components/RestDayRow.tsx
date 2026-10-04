import { Pressable, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

interface RestDayRowProps {
  weekday: number;
  dayNumber?: number;
  /** Si se pasa, el descanso se puede convertir en día de entreno. */
  onPress?: () => void;
}

export function RestDayRow({ weekday, dayNumber, onPress }: Readonly<RestDayRowProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const weekdayLabel = t(`weekday.short.${weekday}`);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={
        onPress
          ? t("plan.addDay", { weekday: t(`weekday.long.${weekday}`) })
          : `${weekdayLabel} ${t("plan.rest")}`
      }
      disabled={!onPress}
      onPress={onPress}
      style={[styles.row, { borderColor: c.border }]}
    >
      <Text style={[styles.weekday, { color: c.textSecondary }]}>
        {dayNumber === undefined ? weekdayLabel : `${weekdayLabel} ${dayNumber}`}
      </Text>
      <Text style={[styles.rest, { color: c.textSecondary }]}>{t("plan.rest")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
  },
  weekday: getTextStyle("label"),
  rest: getTextStyle("body"),
});
