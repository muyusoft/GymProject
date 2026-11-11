import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { IconName } from "@/shared/icons";

const ICON_SIZE = 20;

/** Los pasos de la regla, en el orden en que la persona los vive: reps, peso, reps fijas, sin respuesta. */
const POINTS: readonly { key: string; icon: IconName }[] = [
  { key: "range", icon: "repeat" },
  { key: "top", icon: "arrow-up" },
  { key: "fixed", icon: "dumbbell" },
  { key: "noAnswer", icon: "history" },
];

interface ProgressionInfoSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

/** Explica para qué sirve la respuesta de esfuerzo y en qué se basa la sugerencia de subir peso. */
export function ProgressionInfoSheet({ isVisible, onClose }: Readonly<ProgressionInfoSheetProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("session.effort.info.close")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t("session.effort.info.title")}
        </Text>
        {POINTS.map((point) => (
          <View key={point.key} style={styles.row}>
            <IconRenderer name={point.icon} size={ICON_SIZE} color={c.textSecondary} />
            <Text style={[styles.point, { color: c.text }]}>{t(`session.effort.info.points.${point.key}`)}</Text>
          </View>
        ))}
        <Text style={[styles.hint, { color: c.textSecondary }]}>{t("session.effort.info.footer")}</Text>
        <Button variant="secondary" label={t("session.effort.info.close")} block onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    gap: tokens.spacing[4],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  title: getTextStyle("title"),
  row: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[3] },
  point: { ...getTextStyle("body"), flex: 1 },
  hint: getTextStyle("bodySm"),
});
