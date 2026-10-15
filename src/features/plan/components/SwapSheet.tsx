import { useCallback } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View, type ListRenderItem } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, ListRow } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { CatalogExercise } from "../types/plan-generator.types";

interface SwapSheetProps {
  isOpen: boolean;
  alternatives: readonly CatalogExercise[];
  onChoose: (exerciseId: string) => void;
  onClose: () => void;
}

const keyOf = (exercise: CatalogExercise) => exercise.id;
/** La lista ocupa como mucho media pantalla; el resto se ve con scroll. */
const MAX_LIST_SHARE = 0.5;

/** Con qué cambiar un ejercicio de la vista previa: mismos músculos y algo que se pueda hacer con el equipo. */
export function SwapSheet({ isOpen, alternatives, onChoose, onClose }: Readonly<SwapSheetProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { height } = useWindowDimensions();
  const renderItem: ListRenderItem<CatalogExercise> = useCallback(
    ({ item }) => <ListRow title={getExerciseName(item, i18n.language)} onPress={() => onChoose(item.id)} />,
    [i18n.language, onChoose],
  );

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.cancel")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t("plan.wizard.swap.title")}
        </Text>
        {alternatives.length === 0 ? (
          <Text style={[styles.empty, { color: c.textSecondary }]}>{t("plan.wizard.swap.empty")}</Text>
        ) : (
          <FlatList
            data={alternatives}
            keyExtractor={keyOf}
            renderItem={renderItem}
            style={[styles.list, { maxHeight: height * MAX_LIST_SHARE }]}
          />
        )}
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
  empty: getTextStyle("body"),
  list: { flexGrow: 0 },
});
