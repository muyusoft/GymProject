import { useTranslation } from "react-i18next";
import { Button, InlineError } from "@/shared/components";
import { useReopenSession } from "../hooks/use-reopen-session";

interface ReopenSessionButtonProps {
  sessionId: string;
}

/** Con el entreno de hoy terminado: volver a abrirlo para corregir una serie o seguir, sin perder lo hecho. */
export function ReopenSessionButton({ sessionId }: Readonly<ReopenSessionButtonProps>) {
  const { t } = useTranslation();
  const { reopen, isReopening, hasError } = useReopenSession(sessionId);

  return (
    <>
      <Button
        variant="secondary"
        label={t("today.reopen")}
        icon="history"
        block
        loading={isReopening}
        onPress={() => void reopen()}
      />
      {hasError && <InlineError message={t("common.saveError")} />}
    </>
  );
}
