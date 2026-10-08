import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useReduceMotion } from "@/shared/hooks/use-reduce-motion";

/** Las mismas barras del motivo de marca (discos de alturas crecientes). */
const BARS = [
  { id: "bar-1", height: tokens.spacing[4] },
  { id: "bar-2", height: tokens.spacing[6] },
  { id: "bar-3", height: tokens.spacing[8] },
  { id: "bar-4", height: tokens.spacing[10] },
  { id: "bar-5", height: tokens.spacing[12] },
] as const;
const BAR_WIDTH = tokens.spacing[3];
const LAST_BAR = BARS.length - 1;

/** Cada barra se encoge hasta esta fracción de su altura y vuelve a crecer. */
const RESTING_SCALE = 0.35;
const FULL_SCALE = 1;
const HALF_CYCLE_MS = 380;
const STAGGER_MS = 110;

/** Una ola: cada barra crece y se encoge, un poco después que la anterior, sin parar. */
function useBarWave(isMoving: boolean): Animated.Value[] {
  const scales = useRef(BARS.map(() => new Animated.Value(FULL_SCALE))).current;

  useEffect(() => {
    if (!isMoving) {
      scales.forEach((scale) => scale.setValue(FULL_SCALE));
      return undefined;
    }
    const pulse = (scale: Animated.Value, toValue: number) =>
      Animated.timing(scale, {
        toValue,
        duration: HALF_CYCLE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    scales.forEach((scale) => scale.setValue(RESTING_SCALE));
    const wave = Animated.loop(
      Animated.stagger(
        STAGGER_MS,
        scales.map((scale) =>
          Animated.sequence([
            pulse(scale, FULL_SCALE),
            pulse(scale, RESTING_SCALE),
          ]),
        ),
      ),
    );
    wave.start();
    return () => wave.stop();
  }, [isMoving, scales]);

  return scales;
}

interface LoadingBarsProps {
  /** Qué se está cargando; lo anuncia el lector de pantalla. */
  label: string;
}

/**
 * Indicador de carga de la marca: las barras del logotipo crecen en ola. Con "reducir movimiento"
 * activado en el sistema se quedan quietas, y el texto de quien lo usa dice que se está cargando.
 */
export function LoadingBars({ label }: Readonly<LoadingBarsProps>) {
  const { c } = useOverloadTheme();
  const scales = useBarWave(!useReduceMotion());

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={styles.row}
    >
      {BARS.map((bar, index) => (
        <Animated.View
          key={bar.id}
          style={[
            styles.bar,
            {
              height: bar.height,
              backgroundColor:
                index === LAST_BAR ? c.accentText : c.textSecondary,
              transform: [{ scaleY: scales[index] ?? FULL_SCALE }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: tokens.spacing[1] },
  // Crece desde la base, como un disco que se apila, no desde el centro.
  bar: {
    width: BAR_WIDTH,
    borderRadius: tokens.borderRadius.full,
    transformOrigin: "bottom",
  },
});
