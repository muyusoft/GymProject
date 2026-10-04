import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { TodayInsight } from "../utils/recovery-view.utils";
import { joinGroupNames } from "../utils/group-labels.utils";

const BAR_WIDTH = 4;
const ICON_SIZE = 20;

interface RecoveryInsightProps {
  insight: TodayInsight;
}

/** Qué toca hoy y cómo van esos músculos; dice qué ejercicio los cargó y qué día. */
export function RecoveryInsight({ insight }: RecoveryInsightProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const groups = joinGroupNames(insight.groups, (key) => t(key)).toLowerCase();
  const weekday = insight.causeAt === null ? "" : new Intl.DateTimeFormat(i18n.language, { weekday: "long" }).format(insight.causeAt);

  const message = insight.cause
    ? t("recovery.insight.withCause", {
        groups,
        percent: insight.percent,
        exercise: getExerciseName(insight.cause, i18n.language),
        weekday,
      })
    : t("recovery.insight.plain", { groups, percent: insight.percent });

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderLeftColor: c.info }]}>
      <IconRenderer name="info" size={ICON_SIZE} color={c.info} />
      <Text style={[styles.text, { color: c.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    borderLeftWidth: BAR_WIDTH,
  },
  text: { ...getTextStyle("body"), flex: 1 },
});
