import { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { filterPickerItems } from "../utils/picker.utils";
import type { PickerItem } from "../utils/progress-view.utils";

const ICON_SIZE = 20;
const SHEET_HEIGHT = "80%";

interface ExercisePickerSheetProps {
  visible: boolean;
  items: readonly PickerItem[];
  selectedId: string | null;
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

const keyOf = (item: PickerItem) => item.exerciseId;

/** Todos los ejercicios con sesiones en el periodo, con buscador, del más al menos entrenado. */
export function ExercisePickerSheet({ visible, items, selectedId, onSelect, onClose }: ExercisePickerSheetProps) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterPickerItems(items, query), [items, query]);

  const renderItem = useCallback(
    ({ item }: { item: PickerItem }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${getExerciseName(item, i18n.language)}, ${t("progress.picker.sessions", { count: item.count })}`}
        accessibilityState={{ selected: item.exerciseId === selectedId }}
        onPress={() => {
          onSelect(item.exerciseId);
          onClose();
        }}
        style={styles.row}
      >
        <View style={styles.texts}>
          <Text style={[styles.name, { color: c.text }]}>{getExerciseName(item, i18n.language)}</Text>
          <Text style={[styles.count, { color: c.textSecondary }]}>
            {t("progress.picker.sessions", { count: item.count })}
          </Text>
        </View>
        {item.exerciseId === selectedId && <IconRenderer name="check" size={ICON_SIZE} color={c.accentText} />}
      </Pressable>
    ),
    [c, i18n.language, onClose, onSelect, selectedId, t],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("progress.picker.close")} onPress={onClose} style={[styles.backdrop, { backgroundColor: c.overlay }]} />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text style={[styles.title, { color: c.text }]}>{t("progress.picker.title")}</Text>
        <TextInput
          accessibilityLabel={t("progress.picker.search")}
          placeholder={t("progress.picker.search")}
          placeholderTextColor={c.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          style={[styles.search, { backgroundColor: c.surfaceAlt, color: c.text }]}
        />
        <FlatList
          data={filtered}
          keyExtractor={keyOf}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={[styles.count, { color: c.textSecondary }]}>{t("progress.picker.empty")}</Text>}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    height: SHEET_HEIGHT,
    gap: tokens.spacing[3],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  title: getTextStyle("title"),
  search: {
    ...getTextStyle("body"),
    minHeight: tokens.dimensions.minTouch,
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
  },
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
  },
  texts: { flex: 1 },
  name: getTextStyle("title"),
  count: getTextStyle("bodySm"),
});
