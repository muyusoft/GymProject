import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { INTRO_STEPS } from "../types/intro.types";

interface IntroTopBarProps {
  index: number;
  onSkip: () => void;
}

/** Barra de pasos (uno por tarjeta) y la salida "Saltar", siempre visible. */
export function IntroTopBar({ index, onSkip }: Readonly<IntroTopBarProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const total = INTRO_STEPS.length;

  return (
    <View style={styles.row}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t("intro.progress", { current: index + 1, total })}
        accessibilityValue={{ min: 1, max: total, now: index + 1 }}
        style={styles.segments}
      >
        {INTRO_STEPS.map((step, position) => (
          <View
            key={step}
            style={[styles.segment, { backgroundColor: position <= index ? c.text : c.border }]}
          />
        ))}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t("intro.skip")} onPress={onSkip} style={styles.skip}>
        <Text style={[styles.skipLabel, { color: c.textSecondary }]}>{t("intro.skip")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
    paddingHorizontal: tokens.dimensions.screenGutter,
  },
  segments: { flex: 1, flexDirection: "row", gap: tokens.spacing[1] },
  segment: { flex: 1, height: tokens.spacing[1], borderRadius: tokens.borderRadius.full },
  skip: { minHeight: tokens.dimensions.minTouch, justifyContent: "center", paddingLeft: tokens.spacing[2] },
  skipLabel: { ...getTextStyle("body"), fontFamily: tokens.typography.fontFamily.sansSemibold },
});
