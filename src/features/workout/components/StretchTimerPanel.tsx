import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { formatClock } from "@/shared/utils/duration.utils";
import type { ActiveStretch } from "../hooks/use-stretch-timer";
import type { Movement } from "../types/warmup.types";

interface StretchTimerPanelProps {
  active: ActiveStretch | null;
  remaining: number;
  /** El siguiente sin hacer; null cuando ya están todos. */
  next: Movement | null;
  onStart: (movement: Movement) => void;
  onStop: () => void;
}

/** El estiramiento en curso con su cuenta atrás, o el botón para empezar el siguiente. */
export function StretchTimerPanel({ active, remaining, next, onStart, onStop }: Readonly<StretchTimerPanelProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  if (!active) {
    if (!next) return null;
    const name = t(`movement.${next.id}.name`);
    return <Button icon="play" label={t("stretch.start", { name })} block onPress={() => onStart(next)} />;
  }

  const name = t(`movement.${active.movement.id}.name`);
  const label = active.movement.dose.isPerSide ? t("stretch.side", { name, side: active.side }) : name;
  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={t("stretch.remaining", { label, seconds: remaining })}
      style={[styles.panel, { backgroundColor: c.surface }]}
    >
      <View style={styles.texts}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
        <Text style={[styles.clock, { color: c.text }]}>{formatClock(remaining)}</Text>
      </View>
      <Button variant="ghost" icon="x" label={t("stretch.stop")} onPress={onStop} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
  },
  texts: { flex: 1 },
  label: getTextStyle("bodySm"),
  clock: getTextStyle("title"),
});
