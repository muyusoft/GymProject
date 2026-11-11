import { useTranslation } from "react-i18next";
import { Button, InlineError } from "@/shared/components";
import type { SubstituteScope } from "../types/workout.types";

interface SubstituteActionsProps {
  selectedId: string | null;
  /** El ejercicio ya está sustituido hoy: se ofrece volver al del plan. */
  canRestore: boolean;
  originalExerciseId: string;
  isApplying: boolean;
  hasError: boolean;
  onApply: (substituteId: string, scope: SubstituteScope) => void;
}

/** En el entreno, el cambio se aplica solo hoy o también en el plan; si ya estaba sustituido, se puede volver. */
export function SubstituteActions({
  selectedId,
  canRestore,
  originalExerciseId,
  isApplying,
  hasError,
  onApply,
}: Readonly<SubstituteActionsProps>) {
  const { t } = useTranslation();

  return (
    <>
      {hasError && <InlineError message={t("common.saveError")} />}
      <Button
        label={t("substitute.onlyToday")}
        block
        loading={isApplying}
        disabled={selectedId === null}
        onPress={() => selectedId && onApply(selectedId, "today")}
      />
      <Button
        variant="secondary"
        label={t("substitute.alsoPlan")}
        block
        disabled={selectedId === null || isApplying}
        onPress={() => selectedId && onApply(selectedId, "plan")}
      />
      {canRestore && (
        <Button
          variant="ghost"
          label={t("substitute.restore")}
          block
          disabled={isApplying}
          onPress={() => onApply(originalExerciseId, "today")}
        />
      )}
    </>
  );
}
