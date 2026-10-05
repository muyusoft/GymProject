import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { SubstituteTarget } from "../hooks/use-substitution";
import type { SubstituteScope } from "../types/workout.types";
import { SubstituteContent } from "./SubstituteContent";

const SHEET_HEIGHT = "85%";

interface SubstituteSheetProps {
  /** El ejercicio a cambiar; null mantiene la hoja cerrada. */
  target: SubstituteTarget | null;
  /** Los ejercicios del entreno de hoy (no se ofrecen como sustitutos). Debe ser estable. */
  excludedIds: readonly string[];
  isApplying: boolean;
  hasError: boolean;
  onApply: (substituteId: string, scope: SubstituteScope) => void;
  onClose: () => void;
}

export function SubstituteSheet({ target, excludedIds, isApplying, hasError, onApply, onClose }: Readonly<SubstituteSheetProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  // La hoja es un Modal y taparía la ficha del ejercicio: se oculta al abrirla y vuelve al regresar a esta pantalla.
  const [isShowingInfo, setIsShowingInfo] = useState(false);
  useFocusEffect(useCallback(() => setIsShowingInfo(false), []));

  return (
    <Modal visible={target !== null && !isShowingInfo} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("substitute.close")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        {target && (
          <SubstituteContent
            key={target.slot.planExerciseId}
            target={target}
            excludedIds={excludedIds}
            isApplying={isApplying}
            hasError={hasError}
            onApply={onApply}
            onOpenInfo={() => setIsShowingInfo(true)}
          />
        )}
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
});
