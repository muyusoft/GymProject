import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, Chip, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { DaySummary } from "../types/plan.types";

interface DayActionsSheetProps {
  day: DaySummary | null;
  freeWeekdays: readonly number[];
  hasError: boolean;
  onMove: (weekday: number) => void;
  onDuplicate: (weekday: number) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function DayActionsSheet({
  day,
  freeWeekdays,
  hasError,
  onMove,
  onDuplicate,
  onRemove,
  onClose,
}: DayActionsSheetProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  const renderTargets = (onSelect: (weekday: number) => void) => (
    <View style={styles.chips}>
      {freeWeekdays.map((weekday) => (
        <Chip
          key={weekday}
          label={t(`weekday.long.${weekday}`)}
          selected={false}
          onPress={() => onSelect(weekday)}
        />
      ))}
    </View>
  );

  return (
    <Modal visible={day !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.cancel")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text style={[styles.title, { color: c.text }]}>{day?.name}</Text>
        {freeWeekdays.length === 0 ? (
          <Text style={[styles.label, { color: c.textSecondary }]}>
            {t("plan.actions.noFreeDays")}
          </Text>
        ) : (
          <>
            <Text style={[styles.label, { color: c.textSecondary }]}>{t("plan.actions.move")}</Text>
            {renderTargets(onMove)}
            <Text style={[styles.label, { color: c.textSecondary }]}>
              {t("plan.actions.duplicate")}
            </Text>
            {renderTargets(onDuplicate)}
          </>
        )}
        {hasError && <InlineError message={t("common.saveError")} />}
        <Button variant="danger" label={t("plan.actions.remove")} block onPress={onRemove} />
        <Button variant="ghost" label={t("common.cancel")} block onPress={onClose} />
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
  label: getTextStyle("label"),
  chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
