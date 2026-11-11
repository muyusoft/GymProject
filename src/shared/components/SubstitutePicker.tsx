import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSubstitutes } from "@/shared/hooks/use-substitutes";
import type { SubstituteSubject } from "@/shared/types/substitute.types";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { AsyncStateView } from "./AsyncStateView";
import { Chip } from "./Chip";
import { SubstituteRow } from "./SubstituteRow";

interface SubstitutePickerProps {
  subject: SubstituteSubject;
  excludedIds: readonly string[];
  onOpenInfo: () => void;
  /** Los botones para aplicar; reciben la alternativa elegida, o null si no hay una visible. */
  renderActions: (selectedId: string | null) => ReactNode;
}

/** Sugerencias con filtro por equipo y búsqueda libre; cada pantalla decide cómo se aplica el cambio. */
export function SubstitutePicker({ subject, excludedIds, onOpenInfo, renderActions }: Readonly<SubstitutePickerProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const substitutes = useSubstitutes(subject.originalExerciseId, excludedIds);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isSearching = substitutes.query.trim() !== "";
  const hasSelection = selectedId !== null && substitutes.candidates.some((item) => item.exerciseId === selectedId);

  return (
    <>
      <Text style={[styles.title, { color: c.text }]}>
        {t("substitute.title", { name: getExerciseName(subject, i18n.language) })}
      </Text>
      <TextInput
        accessibilityLabel={t("substitute.search")}
        placeholder={t("substitute.search")}
        placeholderTextColor={c.textSecondary}
        value={substitutes.query}
        onChangeText={substitutes.setQuery}
        autoCorrect={false}
        style={[styles.search, { backgroundColor: c.surfaceAlt, color: c.text }]}
      />
      {!isSearching && substitutes.equipments.length > 1 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label={t("substitute.allEquipment")} selected={substitutes.equipment === null} onPress={() => substitutes.setEquipment(null)} />
            {substitutes.equipments.map((equipment) => (
              <Chip
                key={equipment}
                label={t(`equipment.${equipment}`)}
                selected={substitutes.equipment === equipment}
                onPress={() => substitutes.setEquipment(equipment)}
              />
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.list}>
        <AsyncStateView status={substitutes.status} onRetry={() => void substitutes.reload()}>
          <ScrollView contentContainerStyle={styles.rows} keyboardShouldPersistTaps="handled">
            {substitutes.candidates.map((candidate) => (
              <SubstituteRow
                key={candidate.exerciseId}
                candidate={candidate}
                isSelected={candidate.exerciseId === selectedId}
                onSelect={setSelectedId}
                onOpenInfo={onOpenInfo}
              />
            ))}
            {substitutes.candidates.length === 0 && (
              <Text style={[styles.empty, { color: c.textSecondary }]}>
                {t(isSearching ? "substitute.emptySearch" : "substitute.empty")}
              </Text>
            )}
          </ScrollView>
        </AsyncStateView>
      </View>
      {renderActions(hasSelection ? selectedId : null)}
    </>
  );
}

const styles = StyleSheet.create({
  title: getTextStyle("title"),
  search: {
    ...getTextStyle("body"),
    minHeight: tokens.dimensions.minTouch,
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
  },
  chips: { gap: tokens.spacing[2] },
  list: { flex: 1 },
  rows: { gap: tokens.spacing[2] },
  empty: { ...getTextStyle("body"), textAlign: "center", padding: tokens.spacing[4] },
});
