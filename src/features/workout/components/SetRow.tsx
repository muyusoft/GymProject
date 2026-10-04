import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { formatClock } from "@/shared/utils/duration.utils";
import { formatNumber } from "@/shared/utils/weight.utils";
import type { SessionSet } from "../types/workout.types";
import { isTimed, usesWeight } from "../utils/set-display.utils";
import type { SetStatus } from "../utils/session-stats.utils";

const CHECK_ICON_SIZE = 24;
const ACTIVE_BORDER_WIDTH = 2;

interface SetRowProps {
  set: SessionSet;
  status: SetStatus;
  onToggle: () => void;
  onEdit: () => void;
}

/** Tocar el check completa la serie; tocar peso o reps abre el ajuste (sin teclado). */
export function SetRow({ set, status, onToggle, onEdit }: SetRowProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const isDone = status === "done";
  const number = set.index + 1;

  const repsValue = isTimed(set.loadType) ? formatClock(set.seconds ?? 0) : String(set.reps ?? 0);
  const repsUnit = isTimed(set.loadType) ? "" : t("session.repsUnit");

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isDone ? c.surfaceAlt : c.surface,
          borderColor: isDone || status === "active" ? c.accent : c.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("session.editSet", { index: number })}${set.isPR ? `, ${t("session.recordLabel")}` : ""}`}
        onPress={onEdit}
        style={styles.values}
      >
        <View style={styles.indexColumn}>
          <Text style={[styles.index, { color: set.isPR ? c.reward : c.textSecondary }]}>
            {t("session.setLabel", { index: number })}
          </Text>
          {set.isPR && <Text style={[styles.index, { color: c.reward }]}>{t("session.record")}</Text>}
        </View>
        <Text style={[styles.number, { color: c.text }]}>
          {usesWeight(set.loadType) && set.weight !== null ? formatNumber(set.weight, i18n.language) : "—"}
          <Text style={[styles.unit, { color: c.textSecondary }]}>
            {usesWeight(set.loadType) ? ` ${set.unit}` : ""}
          </Text>
        </Text>
        <Text style={[styles.number, { color: c.text }]}>
          {repsValue}
          <Text style={[styles.unit, { color: c.textSecondary }]}>{repsUnit ? ` ${repsUnit}` : ""}</Text>
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={t(isDone ? "session.unmarkSet" : "session.markSet", { index: number })}
        accessibilityState={{ checked: isDone }}
        onPress={onToggle}
        style={[
          styles.check,
          isDone ? { backgroundColor: c.accent } : { borderColor: c.border, borderWidth: ACTIVE_BORDER_WIDTH },
        ]}
      >
        {isDone && <IconRenderer name="check" size={CHECK_ICON_SIZE} color={c.onAccent} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.dimensions.minTouch + tokens.spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    borderWidth: ACTIVE_BORDER_WIDTH,
  },
  values: {
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
  },
  indexColumn: { width: tokens.spacing[10] },
  index: getTextStyle("label"),
  number: { ...getTextStyle("numeric"), flex: 1 },
  unit: getTextStyle("bodySm"),
  check: {
    width: tokens.dimensions.setCheck,
    height: tokens.dimensions.setCheck,
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
