import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";
import { useTranslation } from "react-i18next";
import {
  requestSync,
  resolveSyncChoice,
} from "@/shared/services/sync/sync.service";
import { useSessionStore, useSyncStore } from "@/shared/store";

/**
 * Cuándo se sincroniza sin que nadie lo pida: al iniciar sesión, al arrancar con sesión y cada vez que
 * la app vuelve a primer plano. También pregunta, una vez por choque, con qué datos quedarse.
 * `isReady` evita tocar la base antes de que terminen las migraciones.
 */
export function useSyncTriggers(isReady: boolean): void {
  const { t } = useTranslation();
  const isSignedIn = useSessionStore((state) => state.status === "signedIn");
  const needsChoice = useSyncStore((state) => state.status === "needsChoice");
  const hasAsked = useRef(false);

  useEffect(() => {
    if (!isReady || !isSignedIn) return undefined;
    void requestSync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void requestSync();
    });
    return () => subscription.remove();
  }, [isReady, isSignedIn]);

  useEffect(() => {
    if (!needsChoice) {
      hasAsked.current = false;
      return;
    }
    if (hasAsked.current) return;
    hasAsked.current = true;
    Alert.alert(t("sync.choice.title"), t("sync.choice.message"), [
      {
        text: t("sync.choice.keepPhone"),
        onPress: () => void resolveSyncChoice("phone"),
      },
      {
        text: t("sync.choice.keepAccount"),
        onPress: () => void resolveSyncChoice("account"),
      },
      { text: t("sync.choice.later"), style: "cancel" },
    ]);
  }, [needsChoice, t]);
}
