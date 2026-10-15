import type { IllustrationTones } from "./equipment-illustrations";
import { MOVEMENT_ILLUSTRATIONS, type MovementIllustrationName } from "./movement-illustrations";

/** Proporción de las ilustraciones: 120 × 90. */
const ASPECT_RATIO = 0.75;

interface MovementIllustrationProps {
  name: MovementIllustrationName;
  width: number;
  /** Los colores del tema para cada tono del dibujo. */
  tones: IllustrationTones;
}

/** Ilustración de un movimiento de calentamiento o estiramiento; el alto sale del ancho. */
export function MovementIllustration({ name, width, tones }: Readonly<MovementIllustrationProps>) {
  const Illustration = MOVEMENT_ILLUSTRATIONS[name];
  return <Illustration width={width} height={width * ASPECT_RATIO} tones={tones} />;
}
