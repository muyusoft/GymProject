import { useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { SubstituteSubject } from "@/shared/types/substitute.types";
import { SubstitutePicker } from "./SubstitutePicker";

const SHEET_HEIGHT = "85%";

interface SubstitutePickerSheetProps {
  /** El ejercicio a cambiar; null mantiene la hoja cerrada. */
  subject: SubstituteSubject | null;
  /** Los ejercicios de ese día (no se ofrecen como sustitutos). Debe ser estable. */
  excludedIds: readonly string[];
  onClose: () => void;
  /** Los botones para aplicar; reciben la alternativa elegida, o null si no hay una visible. */
  renderActions: (selectedId: string | null) => ReactNode;
}

/** Hoja para elegir con qué cambiar un ejercicio; la usan Hoy, la sesión y el editor del día. */
export function SubstitutePickerSheet({ subject, excludedIds, onClose, renderActions }: Readonly<SubstitutePickerSheetProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  // La hoja es un Modal y taparía la ficha del ejercicio: se oculta al abrirla y vuelve al regresar a esta pantalla.
  const [isShowingInfo, setIsShowingInfo] = useState(false);
  useFocusEffect(useCallback(() => setIsShowingInfo(false), []));

  return (
    <Modal visible={subject !== null && !isShowingInfo} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("substitute.close")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        {subject && (
          <SubstitutePicker
            key={subject.key}
            subject={subject}
            excludedIds={excludedIds}
            onOpenInfo={() => setIsShowingInfo(true)}
            renderActions={renderActions}
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
