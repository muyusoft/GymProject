import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Chip } from "@/shared/components";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { PickerItem } from "../utils/progress-view.utils";
import { ExercisePickerSheet } from "./ExercisePickerSheet";

interface ExercisePickerProps {
  /** Los más entrenados (más el elegido). */
  items: readonly PickerItem[];
  /** Todos los ejercicios con datos en el periodo. */
  all: readonly PickerItem[];
  selectedId: string | null;
  onSelect: (exerciseId: string) => void;
}

/** Chips con los más entrenados del periodo y "Más" para elegir cualquier otro; elegir cambia la gráfica de 1RM. */
export function ExercisePicker({ items, all, selectedId, onSelect }: Readonly<ExercisePickerProps>) {
  const { t, i18n } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  if (all.length < 2) return null;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <Chip
            key={item.exerciseId}
            label={getExerciseName(item, i18n.language)}
            selected={item.exerciseId === selectedId}
            onPress={() => onSelect(item.exerciseId)}
          />
        ))}
        {all.length > items.length && (
          <Chip label={t("progress.picker.more")} selected={false} onPress={() => setIsSheetOpen(true)} />
        )}
      </ScrollView>
      <ExercisePickerSheet
        visible={isSheetOpen}
        items={all}
        selectedId={selectedId}
        onSelect={onSelect}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: tokens.spacing[2] },
});
