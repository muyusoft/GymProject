import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens, type SemanticColors } from "@/design/tokens";
import { BodyMap } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { MuscleGroup } from "@/shared/types/training.types";
import type { GroupPaintMap } from "@/shared/utils/body-map.utils";
import { IntroCard } from "./IntroCard";

const RECOVERY_STATES = ["worked", "recovering", "ready"] as const;
type RecoveryState = (typeof RECOVERY_STATES)[number];

/** Ejemplo: espalda y bíceps recién trabajados, pecho y hombro recuperando, pierna lista. */
const SAMPLE_GROUPS: Readonly<Record<RecoveryState, readonly MuscleGroup[]>> = {
  worked: ["upper-back", "trapezius", "biceps", "forearm"],
  recovering: ["chest", "deltoids", "triceps", "abs"],
  ready: ["quadriceps", "hamstring", "gluteal", "calves", "adductors"],
};

function stateColors(c: SemanticColors): Record<RecoveryState, string> {
  return { worked: c.recoveryWorked, recovering: c.recoveryRecovering, ready: c.recoveryReady };
}

function buildSampleGroups(colors: Record<RecoveryState, string>): GroupPaintMap {
  return Object.fromEntries(
    RECOVERY_STATES.flatMap((state) => SAMPLE_GROUPS[state].map((group) => [group, { color: colors[state] }])),
  );
}

/** Ilustración del paso 4: la figura muscular con los tres estados de recuperación y su leyenda. */
export function IntroMusclesArt() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const colors = stateColors(c);

  return (
    <IntroCard>
      <View style={styles.legend}>
        {RECOVERY_STATES.map((state) => (
          <View key={state} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors[state] }]} />
            <Text style={[styles.legendLabel, { color: c.textSecondary }]}>{t(`recovery.${state}`)}</Text>
          </View>
        ))}
      </View>
      <BodyMap mode="recovery" groups={buildSampleGroups(colors)} />
    </IntroCard>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: tokens.spacing[3] },
  legendItem: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[1] },
  dot: { width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full },
  legendLabel: getTextStyle("bodySm"),
});
