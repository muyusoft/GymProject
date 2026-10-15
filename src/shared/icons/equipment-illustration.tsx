import {
  EQUIPMENT_ILLUSTRATIONS,
  type EquipmentIllustrationName,
  type IllustrationTones,
} from "./equipment-illustrations";

/** Proporción de las ilustraciones: 120 × 90. */
const ASPECT_RATIO = 0.75;

interface EquipmentIllustrationProps {
  name: EquipmentIllustrationName;
  width: number;
  /** Los colores del tema para cada tono del dibujo. */
  tones: IllustrationTones;
}

/** Ilustración de un equipo de gimnasio; el alto sale del ancho. Decorativa: el nombre va al lado, como texto. */
export function EquipmentIllustration({ name, width, tones }: Readonly<EquipmentIllustrationProps>) {
  const Illustration = EQUIPMENT_ILLUSTRATIONS[name];
  return <Illustration width={width} height={width * ASPECT_RATIO} tones={tones} />;
}
