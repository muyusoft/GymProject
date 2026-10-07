import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, InlineError } from "@/shared/components";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { deleteAccount } from "@/shared/services/session.service";
import { useSessionStore } from "@/shared/store";

/**
 * "Eliminar cuenta", al final de Perfil y solo con sesión iniciada. Borra la cuenta, su copia en la nube
 * y los datos de este teléfono. No se puede deshacer, así que pide confirmar dos veces.
 */
export function DeleteAccountButton() {
  const { t } = useTranslation();
  const isSignedIn = useSessionStore((state) => state.status === "signedIn");
  const { run, isRunning, hasError } = useActionRunner();

  const confirmAgain = () => {
    Alert.alert(
      t("settings.account.deleteConfirm.lastTitle"),
      t("settings.account.deleteConfirm.lastMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.account.deleteConfirm.confirm"),
          style: "destructive",
          onPress: () => void run(deleteAccount),
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      t("settings.account.deleteConfirm.title"),
      t("settings.account.deleteConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.account.deleteConfirm.continue"),
          style: "destructive",
          onPress: confirmAgain,
        },
      ],
    );
  };

  if (!isSignedIn) return null;

  return (
    <>
      <Button
        variant="danger"
        label={t("settings.account.delete")}
        icon="trash"
        block
        loading={isRunning}
        onPress={confirmDelete}
      />
      {hasError && <InlineError message={t("settings.account.deleteError")} />}
    </>
  );
}
