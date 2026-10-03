import { useMemo } from "react";
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";

/**
 * Hook para usar clases Tailwind en React Native
 * NOTA: Por ahora es un placeholder. Cuando una solución como NativeWind
 * esté completamente integrada, esto se reemplazará con la integración real.
 *
 * Alternativas futuras:
 * - NativeWind (https://www.nativewind.dev/)
 * - StyleSheet.create() con tokens
 *
 * Uso (futuro):
 * const styles = useTailwind('px-4 py-2 bg-primary-500 rounded-md');
 */

export const useTailwind = (
  className: string,
): StyleProp<ViewStyle | TextStyle> => {
  return useMemo(() => {
    // TODO: Implementar integración de NativeWind o similar
    // Por ahora retorna un placeholder
    if (className) {
      console.warn(
        `useTailwind: "${className}" - Awaiting Tailwind integration for React Native`,
      );
    }
    return {};
  }, [className]);
};
