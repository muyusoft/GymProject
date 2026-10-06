import { useEffect } from "react";
import { watchSession } from "@/shared/services/session.service";

/** Escucha la sesión de la cuenta mientras la app está abierta. Se monta una sola vez, en el layout raíz. */
export function useSessionWatcher(): void {
  useEffect(() => watchSession(), []);
}
