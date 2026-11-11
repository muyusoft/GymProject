import { useTranslation } from "react-i18next";
import { Button, InlineError } from "@/shared/components";
import { useResetToday } from "../hooks/use-reset-today";

interface ResetTodayButtonProps {
  dayId: string;
  date: string;
  onReset: () => Promise<void>;
}

/**
 * Solo en desarrollo (__DEV__): la app publicada no lo muestra. Pendiente de decidir antes de producción,
 * ver docs/overload/pending-before-production.md.
 */
export function ResetTodayButton({ dayId, date, onReset }: Readonly<ResetTodayButtonProps>) {
  const { t } = useTranslation();
  const { reset, isResetting, hasError } = useResetToday({ dayId, date, onReset });
  if (!__DEV__) return null;

  return (
    <>
      <Button
        variant="danger"
        label={t("today.devReset.button")}
        icon="repeat"
        block
        loading={isResetting}
        onPress={reset}
      />
      {hasError && <InlineError message={t("common.saveError")} />}
    </>
  );
}
