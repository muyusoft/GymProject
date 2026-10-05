import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Stepper } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { formatClock } from "@/shared/utils/duration.utils";
import type { DayDefaults } from "../types/plan.types";
import { CONFIG_LIMITS } from "../utils/exercise-config.utils";

const ICON_SIZE = 20;

interface DayDefaultsPanelProps {
  defaults: DayDefaults;
  onChange: (defaults: DayDefaults) => void;
}

/** Valores base del día: solo se aplican a los ejercicios que se agreguen después. */
export function DayDefaultsPanel({ defaults, onChange }: Readonly<DayDefaultsPanelProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const [isEditing, setIsEditing] = useState(false);
  const { sets, reps, restSec } = CONFIG_LIMITS;

  return (
    <View style={[styles.panel, { backgroundColor: c.surface }]}>
      <View style={styles.summary}>
        <IconRenderer name="sliders" size={ICON_SIZE} color={c.textSecondary} />
        <Text style={[styles.text, { color: c.textSecondary }]}>
          {t("plan.day.defaults", {
            sets: defaults.sets,
            reps: defaults.reps,
            rest: formatClock(defaults.restSec),
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isEditing ? t("plan.day.done") : t("plan.day.change")}
          onPress={() => setIsEditing(!isEditing)}
          style={styles.action}
        >
          <Text style={[styles.actionLabel, { color: c.accentText }]}>
            {isEditing ? t("plan.day.done") : t("plan.day.change")}
          </Text>
        </Pressable>
      </View>
      {isEditing && (
        <>
          <Stepper
            value={defaults.sets}
            {...sets}
            unit={t("plan.config.sets").toLowerCase()}
            onChange={(value) => onChange({ ...defaults, sets: value })}
          />
          <Stepper
            value={defaults.reps}
            {...reps}
            unit={t("plan.config.reps").toLowerCase()}
            onChange={(value) => onChange({ ...defaults, reps: value })}
          />
          <Stepper
            value={defaults.restSec}
            {...restSec}
            unit=""
            formatValue={formatClock}
            onChange={(value) => onChange({ ...defaults, restSec: value })}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
  },
  summary: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  text: { ...getTextStyle("bodySm"), flex: 1 },
  action: { minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  actionLabel: getTextStyle("title"),
});
