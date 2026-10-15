import { useMemo } from "react";
import type { IllustrationTones } from "@/shared/icons";
import { useOverloadTheme } from "./use-overload-theme";

/**
 * Los tonos del mockup tomados del tema, para las ilustraciones de equipo y de movimientos: fondos, tapizados,
 * metal, bordes claros y la persona (con un tono apagado para lo que queda detrás o la posición de inicio).
 */
export function useIllustrationTones(): IllustrationTones {
  const { c } = useOverloadTheme();
  return useMemo(
    () => ({
      deep: c.surface,
      frame: c.surfaceAlt,
      pad: c.border,
      line: c.border,
      metal: c.textSecondary,
      steel: c.textSecondary,
      edge: c.text,
      ink: c.text,
      person: c.info,
      personMuted: c.textSecondary,
    }),
    [c],
  );
}
