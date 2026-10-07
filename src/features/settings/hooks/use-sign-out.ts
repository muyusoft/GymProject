import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { signOut, type SignOutResult } from "@/shared/services/session.service";

interface SignOutFlow {
  /** Pide confirmación y cierra la sesión; si quedan cambios sin subir, pregunta antes de perderlos. */
  confirm: () => void;
  isRunning: boolean;
  hasError: boolean;
}

/**
 * Cerrar sesión borra los datos del teléfono (ya están en la cuenta) y lleva a la bienvenida. Si no se
 * pudieron subir los últimos cambios, avisa y deja elegir entre cancelar o cerrar perdiéndolos.
 */
export function useSignOut(): SignOutFlow {
  const { t } = useTranslation();
  const { run, isRunning, hasError } = useActionRunner();

  const leave = useCallback(
    async (force: boolean) => {
      let result: SignOutResult | null = null;
      await run(async () => {
        result = await signOut({ force });
      });
      // Al cerrar, la app deja de estar "empezada" y el layout de pestañas lleva solo a la bienvenida.
      if (result === "unsyncedChanges") {
        Alert.alert(
          t("settings.account.unsynced.title"),
          t("settings.account.unsynced.message"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("settings.account.unsynced.confirm"),
              style: "destructive",
              onPress: () => void leave(true),
            },
          ],
        );
      }
    },
    [run, t],
  );

  const confirm = useCallback(() => {
    Alert.alert(
      t("settings.account.signOutConfirm.title"),
      t("settings.account.signOutConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.account.signOut"),
          style: "destructive",
          onPress: () => void leave(false),
        },
      ],
    );
  }, [leave, t]);

  return { confirm, isRunning, hasError };
}
