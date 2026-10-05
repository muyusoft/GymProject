import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Badge } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { formatWeight } from "@/shared/utils/weight.utils";
import { IntroCard } from "./IntroCard";

const SAMPLE_ONE_REP_MAX_KG = 92.5;
const SAMPLE_NEXT_WEIGHT_KG = 82.5;
const ICON_SIZE = 20;
const SAMPLE_BARS = [
  { id: "w1", height: tokens.spacing[5] },
  { id: "w2", height: tokens.spacing[6] },
  { id: "w3", height: tokens.spacing[6] },
  { id: "w4", height: tokens.spacing[8] },
  { id: "w5", height: tokens.spacing[10] },
  { id: "w6", height: tokens.spacing[12] },
  { id: "w7", height: tokens.spacing[16] },
] as const;
const LAST_BAR_ID = "w7";

function TrendBars() {
  const { c } = useOverloadTheme();

  return (
    <View style={styles.bars}>
      {SAMPLE_BARS.map((bar) => (
        <View
          key={bar.id}
          style={[
            styles.bar,
            { height: bar.height, backgroundColor: bar.id === LAST_BAR_ID ? c.text : c.surfaceAlt },
          ]}
        />
      ))}
    </View>
  );
}

/** Ilustración del paso 3: 1RM estimado con su récord y la sugerencia de subir peso. */
export function IntroProgressArt() {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const locale = i18n.language;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t("intro.art.progress")} style={styles.art}>
      <IntroCard>
        <View style={styles.header}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("intro.samples.oneRepMax")}</Text>
          <Badge label={t("intro.samples.record")} tone="record" />
        </View>
        <Text style={[styles.value, { color: c.text }]}>
          {formatWeight({ value: SAMPLE_ONE_REP_MAX_KG, unit: "kg", locale })}
        </Text>
        <TrendBars />
      </IntroCard>
      <IntroCard outline={c.accentText}>
        <View style={styles.hint}>
          <View style={[styles.hintIcon, { backgroundColor: c.accent }]}>
            <IconRenderer name="arrow-up" size={ICON_SIZE} color={c.onAccent} />
          </View>
          <View style={styles.hintTexts}>
            <Text style={[styles.hintTitle, { color: c.accentText }]}>
              {t("intro.samples.increase", {
                weight: formatWeight({ value: SAMPLE_NEXT_WEIGHT_KG, unit: "kg", locale }),
              })}
            </Text>
            <Text style={[styles.hintReason, { color: c.textSecondary }]}>
              {t("intro.samples.increaseReason")}
            </Text>
          </View>
        </View>
      </IntroCard>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { gap: tokens.spacing[3] },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[3] },
  label: { ...getTextStyle("label"), flex: 1 },
  value: getTextStyle("displayXl"),
  bars: { flexDirection: "row", alignItems: "flex-end", gap: tokens.spacing[2] },
  bar: { flex: 1, borderRadius: tokens.borderRadius.sm },
  hint: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  hintIcon: {
    width: tokens.spacing[10],
    height: tokens.spacing[10],
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  hintTexts: { flex: 1 },
  hintTitle: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
  hintReason: getTextStyle("bodySm"),
});
