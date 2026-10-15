import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";

const ICON_SIZE = 24;
const BAR_HEIGHT = 4;

interface WizardTopBarProps {
  /** Pregunta actual (desde 0) y total; sin ellas no se muestra la barra de progreso. */
  progress: { current: number; total: number } | null;
  onBack: () => void;
  onClose: () => void;
}

export function WizardTopBar({ progress, onBack, onClose }: Readonly<WizardTopBarProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("common.back")} onPress={onBack} style={styles.button}>
        <IconRenderer name="chevron-left" size={ICON_SIZE} color={c.text} />
      </Pressable>
      <View
        accessible={progress !== null}
        accessibilityLabel={progress ? t("plan.wizard.progress", { current: progress.current + 1, total: progress.total }) : undefined}
        style={styles.segments}
      >
        {progress &&
          Array.from({ length: progress.total }, (_, index) => (
            <View
              key={`step-${index}`}
              style={[styles.segment, { backgroundColor: index <= progress.current ? c.text : c.border }]}
            />
          ))}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t("plan.wizard.close")} onPress={onClose} style={styles.button}>
        <IconRenderer name="x" size={ICON_SIZE} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  button: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  segments: { flex: 1, flexDirection: "row", gap: tokens.spacing[2] },
  segment: { flex: 1, height: BAR_HEIGHT, borderRadius: tokens.borderRadius.full },
});
