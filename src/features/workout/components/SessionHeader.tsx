import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { useElapsed } from "../hooks/use-elapsed";

const ICON_SIZE = 24;
const PERCENT = 100;

interface SessionHeaderProps {
  eyebrow: string;
  startedAt: number;
  endedAt: number | null;
  /** 0 a 1. */
  progress: number;
  onBack: () => void;
  onFinish: () => void;
}

export function SessionHeader({
  eyebrow,
  startedAt,
  endedAt,
  progress,
  onBack,
  onFinish,
}: SessionHeaderProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const clock = useElapsed(startedAt, endedAt);

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={onBack}
          style={[styles.back, { backgroundColor: c.surface }]}
        >
          <IconRenderer name="chevron-left" size={ICON_SIZE} color={c.text} />
        </Pressable>
        <View style={styles.texts}>
          <Text style={[styles.eyebrow, { color: c.textSecondary }]} numberOfLines={2}>
            {eyebrow}
          </Text>
          <Text style={[styles.clock, { color: c.text }]}>{clock}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("session.finish")}
          onPress={onFinish}
          style={[styles.finish, { borderColor: c.border }]}
        >
          <Text style={[styles.finishLabel, { color: c.text }]}>{t("session.finish")}</Text>
        </Pressable>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: PERCENT, now: Math.round(progress * PERCENT) }}
        style={[styles.track, { backgroundColor: c.surfaceAlt }]}
      >
        <View style={[styles.fill, { width: `${progress * PERCENT}%`, backgroundColor: c.accentText }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: tokens.spacing[3] },
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  back: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1 },
  eyebrow: getTextStyle("label"),
  clock: getTextStyle("numeric"),
  finish: {
    minHeight: tokens.dimensions.minTouch,
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  finishLabel: getTextStyle("title"),
  track: { height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, overflow: "hidden" },
  fill: { height: "100%", borderRadius: tokens.borderRadius.full },
});
