import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { formatClock } from "@/shared/utils/duration.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import { IntroCard } from "./IntroCard";

const SAMPLE_WEIGHT_KG = 80;
const SAMPLE_REPS = 8;
const SAMPLE_REST_SECONDS = 84;
const SAMPLE_SETS = [
  { number: 1, isDone: true },
  { number: 2, isDone: true },
  { number: 3, isDone: false },
] as const;
const ICON_SIZE = 16;

function SetRow({ number, isDone }: Readonly<{ number: number; isDone: boolean }>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const weight = formatWeight({ value: SAMPLE_WEIGHT_KG, unit: "kg", locale: i18n.language });

  return (
    <View style={[styles.setRow, { backgroundColor: c.surfaceAlt }]}>
      <Text style={[styles.setNumber, { color: c.textSecondary }]}>{number}</Text>
      <Text style={[styles.setValue, { color: c.text }]}>
        {t("intro.samples.set", { weight, reps: SAMPLE_REPS })}
      </Text>
      <View
        style={[
          styles.status,
          { backgroundColor: isDone ? c.accent : c.surfaceAlt, borderColor: isDone ? c.accent : c.border },
        ]}
      >
        {isDone && <IconRenderer name="check" size={ICON_SIZE} color={c.onAccent} />}
        <Text style={[styles.statusLabel, { color: isDone ? c.onAccent : c.text }]}>
          {t(isDone ? "intro.samples.done" : "intro.samples.mark")}
        </Text>
      </View>
    </View>
  );
}

/** Ilustración del paso 2: series marcadas con un toque y el descanso corriendo. */
export function IntroLogArt() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t("intro.art.log")} style={styles.art}>
      <IntroCard>
        <View style={styles.header}>
          <Text style={[styles.exercise, { color: c.text }]}>{t("intro.samples.exercise")}</Text>
          <Text style={[styles.count, { color: c.textSecondary }]}>
            {t("common.sets", { count: SAMPLE_SETS.length })}
          </Text>
        </View>
        {SAMPLE_SETS.map((set) => (
          <SetRow key={set.number} number={set.number} isDone={set.isDone} />
        ))}
      </IntroCard>
      <View style={[styles.rest, { backgroundColor: c.surface, borderColor: c.border }]}>
        <IconRenderer name="timer" size={ICON_SIZE} color={c.info} />
        <Text style={[styles.restLabel, { color: c.textSecondary }]}>{t("intro.samples.rest")}</Text>
        <Text style={[styles.restValue, { color: c.text }]}>{formatClock(SAMPLE_REST_SECONDS)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { gap: tokens.spacing[3] },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: tokens.spacing[3] },
  exercise: { ...getTextStyle("title"), flex: 1 },
  count: getTextStyle("label"),
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    minHeight: tokens.dimensions.minTouch,
    paddingLeft: tokens.spacing[3],
    paddingRight: tokens.spacing[1],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.borderRadius.md,
  },
  setNumber: getTextStyle("bodySm"),
  setValue: { ...getTextStyle("numeric"), flex: 1 },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[1],
    minHeight: tokens.spacing[10],
    paddingHorizontal: tokens.spacing[3],
    borderRadius: tokens.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  statusLabel: { ...getTextStyle("bodySm"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  rest: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  restLabel: getTextStyle("bodySm"),
  restValue: getTextStyle("numeric"),
});
