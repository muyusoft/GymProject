import { useTranslation } from "react-i18next";
import { Button, InlineError } from "@/shared/components";
import { useSessionStore } from "@/shared/store";
import { useSignOut } from "../hooks/use-sign-out";

/** "Cerrar sesión", al final de Perfil y solo con sesión iniciada. La lógica está en `useSignOut`. */
export function SignOutButton() {
  const { t } = useTranslation();
  const isSignedIn = useSessionStore((state) => state.status === "signedIn");
  const { confirm, isRunning, hasError } = useSignOut();

  // Mientras cierra, la sesión ya no existe pero el botón sigue mostrando que trabaja.
  if (!isSignedIn && !isRunning) return null;

  return (
    <>
      <Button
        variant="secondary"
        label={t("settings.account.signOut")}
        block
        loading={isRunning}
        onPress={confirm}
      />
      {hasError && <InlineError message={t("settings.account.signOutError")} />}
    </>
  );
}
