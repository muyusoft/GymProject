import { useCallback } from "react";
import { SubstitutePickerSheet } from "@/shared/components";
import type { SubstituteTarget } from "../hooks/use-substitution";
import type { SubstituteScope } from "../types/workout.types";
import { SubstituteActions } from "./SubstituteActions";

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

/** La hoja de sustitutos del entreno: solo hoy, también en el plan o volver al original. */
export function SubstituteSheet({ target, excludedIds, isApplying, hasError, onApply, onClose }: Readonly<SubstituteSheetProps>) {
  const renderActions = useCallback(
    (selectedId: string | null) =>
      target && (
        <SubstituteActions
          selectedId={selectedId}
          canRestore={target.slot.isSubstituted}
          originalExerciseId={target.slot.originalExerciseId}
          isApplying={isApplying}
          hasError={hasError}
          onApply={onApply}
        />
      ),
    [target, isApplying, hasError, onApply],
  );

  return (
    <SubstitutePickerSheet
      subject={
        target && {
          key: target.slot.planExerciseId,
          originalExerciseId: target.slot.originalExerciseId,
          nameEs: target.nameEs,
          nameEn: target.nameEn,
        }
      }
      excludedIds={excludedIds}
      onClose={onClose}
      renderActions={renderActions}
    />
  );
}
