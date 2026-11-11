import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, InlineError, SubstitutePickerSheet } from "@/shared/components";
import type { SubstituteSubject } from "@/shared/types/substitute.types";

interface PlanSwapSheetProps {
  subject: SubstituteSubject | null;
  /** Los ejercicios del día (no se ofrecen). Debe ser estable. */
  excludedIds: readonly string[];
  isApplying: boolean;
  hasError: boolean;
  onApply: (substituteId: string) => void;
  onClose: () => void;
}

/** Desde la rutina el cambio siempre va al plan: no hay "solo hoy". */
export function PlanSwapSheet({ subject, excludedIds, isApplying, hasError, onApply, onClose }: Readonly<PlanSwapSheetProps>) {
  const { t } = useTranslation();
  const renderActions = useCallback(
    (selectedId: string | null) => (
      <>
        {hasError && <InlineError message={t("common.saveError")} />}
        <Button
          label={t("substitute.applyToPlan")}
          block
          loading={isApplying}
          disabled={selectedId === null}
          onPress={() => selectedId && onApply(selectedId)}
        />
      </>
    ),
    [hasError, isApplying, onApply, t],
  );

  return (
    <SubstitutePickerSheet subject={subject} excludedIds={excludedIds} onClose={onClose} renderActions={renderActions} />
  );
}
