import Svg, { Circle } from "react-native-svg";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";

const SIZE = tokens.spacing[12] + tokens.spacing[2];
const STROKE = tokens.spacing[2];
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const HALF = SIZE / 2;

interface RestRingProps {
  /** 1 = recién empezado, 0 = terminado. */
  fraction: number;
}

/** Anillo de progreso del descanso (en info); el tiempo restante también va en texto al lado. */
export function RestRing({ fraction }: RestRingProps) {
  const { c } = useOverloadTheme();

  return (
    <Svg width={SIZE} height={SIZE} accessible={false}>
      <Circle cx={HALF} cy={HALF} r={RADIUS} stroke={c.surfaceAlt} strokeWidth={STROKE} fill="none" />
      <Circle
        cx={HALF}
        cy={HALF}
        r={RADIUS}
        stroke={c.info}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
        fill="none"
        rotation={-90}
        origin={`${HALF}, ${HALF}`}
      />
    </Svg>
  );
}
