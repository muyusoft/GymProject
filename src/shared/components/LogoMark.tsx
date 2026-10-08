import { StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

/**
 * Geometría del símbolo "Discos" en su rejilla de 48: tres discos de ancho y alto crecientes, centrados
 * en vertical. Es la misma que usa `scripts/generate-brand-assets.cjs` para el icono de la app.
 */
const GRID = 48;
const DISCS = [
  { id: "small", width: 8, height: 14 },
  { id: "medium", width: 9, height: 26 },
  { id: "large", width: 10, height: 38 },
] as const;
const DISC_GAP = 4;

interface LogoMarkProps {
  /** Alto del símbolo; el ancho sale de la proporción. */
  size: number;
}

/** Símbolo de Overset. Es decoración: quien lo use pone al lado el nombre o una etiqueta accesible. */
export function LogoMark({ size }: Readonly<LogoMarkProps>) {
  const { mode } = useOverloadTheme();
  const scale = size / GRID;
  const shades = tokens.brand[mode].logo;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.row, { height: size, gap: DISC_GAP * scale }]}
    >
      {DISCS.map((disc, index) => (
        <View
          key={disc.id}
          style={[
            styles.disc,
            {
              width: disc.width * scale,
              height: disc.height * scale,
              backgroundColor: shades[index],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  disc: { borderRadius: tokens.borderRadius.full },
});
