import { router } from "expo-router";
import { useEffect } from "react";
import { AppLayout } from "@/shared/layouts";

/**
 * Dirección a la que vuelve el navegador tras iniciar sesión con Google. Normalmente la app no llega a
 * mostrarla; si el sistema la abre como enlace, se regresa a la pantalla que inició el proceso, que es
 * la que termina de crear la sesión.
 */
export default function AuthCallbackRoute() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  return <AppLayout>{null}</AppLayout>;
}
