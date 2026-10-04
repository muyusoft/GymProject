import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { formatClock } from "@/shared/utils/duration.utils";
import { successFeedback } from "@/shared/services/haptics.service";
import { useCountdown } from "../hooks/use-countdown";
import { ringFraction } from "../utils/elapsed.utils";
import { RestRing } from "./RestRing";

const STEP_SEC = 15;
const BORDER_WIDTH = 2;
const SKIP_ICON_SIZE = 20;

interface RestTimerProps {
  endsAt: number;
  totalSec: number;
  onAdd: (deltaSec: number) => void;
  onSkip: () => void;
}

/** Recibe la hora de fin, no un contador: sigue bien aunque se bloquee la pantalla. Vibra al terminar. */
export function RestTimer({ endsAt, totalSec, onAdd, onSkip }: RestTimerProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const handleDone = useCallback(() => void successFeedback(), []);
  const remaining = useCountdown(endsAt, handleDone);

  const renderStep = (delta: number, label: string, a11y: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={() => onAdd(delta)}
      style={[styles.step, { backgroundColor: c.surfaceAlt }]}
    >
      <Text style={[styles.stepLabel, { color: c.text }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.bar, { backgroundColor: c.surface, borderColor: c.info }]}>
      <RestRing fraction={ringFraction(remaining, totalSec)} />
      <View style={styles.texts}>
        <Text style={[styles.label, { color: c.textSecondary }]}>
          {t(remaining === 0 ? "session.restDone" : "session.rest")}
        </Text>
        <Text accessibilityLiveRegion="polite" style={[styles.time, { color: c.text }]}>
          {formatClock(remaining)}
        </Text>
      </View>
      {renderStep(-STEP_SEC, `−${STEP_SEC}`, t("session.restSubtract", { seconds: STEP_SEC }))}
      {renderStep(STEP_SEC, `+${STEP_SEC}`, t("session.restAdd", { seconds: STEP_SEC }))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("session.restSkip")}
        onPress={onSkip}
        style={styles.skip}
      >
        <IconRenderer name="x" size={SKIP_ICON_SIZE} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.lg,
    borderWidth: BORDER_WIDTH,
  },
  texts: { flex: 1 },
  label: getTextStyle("label"),
  time: getTextStyle("numeric"),
  step: {
    minWidth: tokens.dimensions.minTouch,
    minHeight: tokens.dimensions.minTouch,
    paddingHorizontal: tokens.spacing[2],
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: getTextStyle("title"),
  skip: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
