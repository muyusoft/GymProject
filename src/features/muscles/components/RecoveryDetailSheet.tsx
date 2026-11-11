import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { useRecoveryDetail } from "../hooks/use-recovery-detail";
import type { RecoveryLine } from "../utils/recovery-view.utils";

interface RecoveryDetailSheetProps {
  /** La línea tocada; null mantiene la hoja cerrada. */
  line: RecoveryLine | null;
  now: number;
  onClose: () => void;
}

/** Por qué un grupo está como está: qué ejercicio lo trabajó, cuánto necesita y cuándo estará listo. */
export function RecoveryDetailSheet({ line, now, onClose }: Readonly<RecoveryDetailSheetProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const detail = useRecoveryDetail(line, now);
  const exercises = line?.causes.map((cause) => getExerciseName(cause, i18n.language)).join(", ") ?? "";

  return (
    <Modal visible={line !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("recovery.detail.close")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {detail.title}
        </Text>
        {detail.facts.map((fact) => (
          <Text key={fact} style={[styles.fact, { color: c.text }]}>
            {fact}
          </Text>
        ))}
        {exercises !== "" && (
          <Text style={[styles.fact, { color: c.text }]}>{t("recovery.detail.causes", { exercises })}</Text>
        )}
        <Text style={[styles.rule, { color: c.textSecondary }]}>{t("recovery.detail.rule")}</Text>
        <Button variant="secondary" label={t("recovery.detail.close")} block onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  title: getTextStyle("title"),
  fact: getTextStyle("body"),
  rule: getTextStyle("bodySm"),
});
