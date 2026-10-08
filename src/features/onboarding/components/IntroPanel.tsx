import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { INTRO_STEPS } from "../types/intro.types";
import { isLastStep } from "../utils/intro.utils";

interface IntroPanelProps {
  index: number;
  onBack: () => void;
  onNext: () => void;
}

/** Texto del paso actual y sus botones. Crece con el texto: sin alturas fijas. */
export function IntroPanel({
  index,
  onBack,
  onNext,
}: Readonly<IntroPanelProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  // El panel llega hasta el borde de la pantalla; su contenido se detiene antes de la línea de inicio.
  const { bottom } = useSafeAreaInsets();
  const total = INTRO_STEPS.length;
  const step = INTRO_STEPS[index] ?? INTRO_STEPS[0];
  const nextLabel = isLastStep(index, total)
    ? t("intro.start")
    : t("common.next");

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: c.surface,
          paddingBottom: tokens.spacing[6] + bottom,
        },
      ]}
    >
      <Text style={[styles.counter, { color: c.textSecondary }]}>
        {t("intro.progress", { current: index + 1, total })}
      </Text>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: c.text }]}
      >
        {t(`intro.steps.${step}.title`)}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t(`intro.steps.${step}.body`)}
      </Text>
      <View style={styles.actions}>
        {index > 0 && (
          <View style={styles.back}>
            <Button
              variant="secondary"
              label={t("common.back")}
              block
              onPress={onBack}
            />
          </View>
        )}
        <View style={styles.next}>
          <Button label={nextLabel} block onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: tokens.spacing[2],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  counter: getTextStyle("label"),
  title: getTextStyle("displayLg"),
  body: getTextStyle("body"),
  actions: {
    flexDirection: "row",
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[3],
  },
  back: { flex: 1 },
  next: { flex: 2 },
});
