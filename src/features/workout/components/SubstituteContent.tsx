import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, Button, Chip, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { useSubstitutes } from "../hooks/use-substitutes";
import type { SubstituteTarget } from "../hooks/use-substitution";
import type { SubstituteScope } from "../types/workout.types";
import { SubstituteRow } from "./SubstituteRow";

interface SubstituteContentProps {
  target: SubstituteTarget;
  excludedIds: readonly string[];
  isApplying: boolean;
  hasError: boolean;
  onApply: (substituteId: string, scope: SubstituteScope) => void;
  onOpenInfo: () => void;
}

/** Sugerencias con filtro por equipo, búsqueda libre y las dos formas de aplicar: solo hoy o también en el plan. */
export function SubstituteContent({ target, excludedIds, isApplying, hasError, onApply, onOpenInfo }: Readonly<SubstituteContentProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const substitutes = useSubstitutes(target.slot.originalExerciseId, excludedIds);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isSearching = substitutes.query.trim() !== "";
  const hasSelection = selectedId !== null && substitutes.candidates.some((item) => item.exerciseId === selectedId);

  return (
    <>
      <Text style={[styles.title, { color: c.text }]}>
        {t("substitute.title", { name: getExerciseName(target, i18n.language) })}
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
      {hasError && <InlineError message={t("common.saveError")} />}
      <Button
        label={t("substitute.onlyToday")}
        block
        loading={isApplying}
        disabled={!hasSelection}
        onPress={() => selectedId && onApply(selectedId, "today")}
      />
      <Button
        variant="secondary"
        label={t("substitute.alsoPlan")}
        block
        disabled={!hasSelection || isApplying}
        onPress={() => selectedId && onApply(selectedId, "plan")}
      />
      {target.slot.isSubstituted && (
        <Button
          variant="ghost"
          label={t("substitute.restore")}
          block
          disabled={isApplying}
          onPress={() => onApply(target.slot.originalExerciseId, "today")}
        />
      )}
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
