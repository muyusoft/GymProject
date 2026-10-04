import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Chip } from "@/shared/components";
import {
  EQUIPMENTS,
  MUSCLE_CATEGORIES,
  type Equipment,
  type MuscleCategory,
} from "@/shared/types/training.types";
import type { LibraryFilters } from "../types/catalog.types";

interface LibraryFilterBarProps {
  filters: LibraryFilters;
  onCategoryChange: (category: MuscleCategory | null) => void;
  onEquipmentChange: (equipment: Equipment | null) => void;
}

/** Tocar el chip activo lo quita; "Equipo" despliega la fila de equipos. */
export function LibraryFilterBar({
  filters,
  onCategoryChange,
  onEquipmentChange,
}: LibraryFilterBarProps) {
  const { t } = useTranslation();
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(filters.equipment !== null);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {MUSCLE_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={t(`library.category.${category}`)}
            selected={filters.category === category}
            onPress={() => onCategoryChange(filters.category === category ? null : category)}
          />
        ))}
        <Chip
          label={t("library.equipment")}
          selected={isEquipmentOpen}
          onPress={() => setIsEquipmentOpen(!isEquipmentOpen)}
        />
      </View>
      {isEquipmentOpen && (
        <View style={styles.row}>
          {EQUIPMENTS.map((equipment) => (
            <Chip
              key={equipment}
              label={t(`equipment.${equipment}`)}
              selected={filters.equipment === equipment}
              onPress={() => onEquipmentChange(filters.equipment === equipment ? null : equipment)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing[2] },
  row: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
