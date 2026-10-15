/**
 * Ilustraciones del equipo de gimnasio (paso "¿Con qué equipo cuentas?"). A diferencia de los iconos, son 4:3 y
 * de varios tonos, como el mockup. En cada .svg los colores son marcadores (los tonos del mockup) que .svgrrc de
 * esta carpeta cambia por `props.tones`: quien la usa pasa los colores del tema, así funcionan en claro y oscuro. El registro está tipado con GYM_EQUIPMENT:
 * agregar un equipo a la lista sin su ilustración es un error de compilación.
 */

import type { FC } from "react";
import type { SvgProps } from "react-native-svg";
import type { GymEquipment } from "@/shared/types/equipment.types";

import EquipmentDumbbells from "./equipment-dumbbells.svg";
import EquipmentBarbell from "./equipment-barbell.svg";
import EquipmentKettlebell from "./equipment-kettlebell.svg";
import EquipmentAdjustableBench from "./equipment-adjustable-bench.svg";
import EquipmentBenchPress from "./equipment-bench-press.svg";
import EquipmentRack from "./equipment-rack.svg";
import EquipmentSmith from "./equipment-smith.svg";
import EquipmentTBarRow from "./equipment-t-bar-row.svg";
import EquipmentPreacherBench from "./equipment-preacher-bench.svg";
import EquipmentPullUpBar from "./equipment-pull-up-bar.svg";
import EquipmentPowerTower from "./equipment-power-tower.svg";
import EquipmentTrx from "./equipment-trx.svg";
import EquipmentBands from "./equipment-bands.svg";
import EquipmentCableTower from "./equipment-cable-tower.svg";
import EquipmentLatPulldown from "./equipment-lat-pulldown.svg";
import EquipmentSeatedRow from "./equipment-seated-row.svg";
import EquipmentChestSupportedRow from "./equipment-chest-supported-row.svg";
import EquipmentChestPress from "./equipment-chest-press.svg";
import EquipmentShoulderPress from "./equipment-shoulder-press.svg";
import EquipmentPecDeck from "./equipment-pec-deck.svg";
import EquipmentBicepsMachine from "./equipment-biceps-machine.svg";
import EquipmentLegPress from "./equipment-leg-press.svg";
import EquipmentHackSquat from "./equipment-hack-squat.svg";
import EquipmentSquatMachine from "./equipment-squat-machine.svg";
import EquipmentHipThrustMachine from "./equipment-hip-thrust-machine.svg";
import EquipmentLegExtension from "./equipment-leg-extension.svg";
import EquipmentLyingLegCurl from "./equipment-lying-leg-curl.svg";
import EquipmentSeatedLegCurl from "./equipment-seated-leg-curl.svg";
import EquipmentCalfMachine from "./equipment-calf-machine.svg";
import EquipmentHipMachine from "./equipment-hip-machine.svg";
import EquipmentBackExtension from "./equipment-back-extension.svg";
import EquipmentNone from "./equipment-none.svg";

/** "none": la opción "No tengo equipo". */
export type EquipmentIllustrationName = GymEquipment | "none";

/**
 * Los tonos de una ilustración, de lo más oscuro a lo más claro, más el de la persona y el de la parte de la
 * persona que queda detrás o es la posición de inicio (más apagado).
 */
export interface IllustrationTones {
  deep: string;
  frame: string;
  pad: string;
  line: string;
  metal: string;
  steel: string;
  edge: string;
  ink: string;
  person: string;
  personMuted: string;
}

export type IllustrationProps = SvgProps & { tones: IllustrationTones };

export const EQUIPMENT_ILLUSTRATIONS: Record<EquipmentIllustrationName, FC<IllustrationProps>> = {
  dumbbells: EquipmentDumbbells,
  barbell: EquipmentBarbell,
  kettlebell: EquipmentKettlebell,
  adjustableBench: EquipmentAdjustableBench,
  benchPress: EquipmentBenchPress,
  rack: EquipmentRack,
  smith: EquipmentSmith,
  tBarRow: EquipmentTBarRow,
  preacherBench: EquipmentPreacherBench,
  pullUpBar: EquipmentPullUpBar,
  powerTower: EquipmentPowerTower,
  trx: EquipmentTrx,
  bands: EquipmentBands,
  cableTower: EquipmentCableTower,
  latPulldown: EquipmentLatPulldown,
  seatedRow: EquipmentSeatedRow,
  chestSupportedRow: EquipmentChestSupportedRow,
  chestPress: EquipmentChestPress,
  shoulderPress: EquipmentShoulderPress,
  pecDeck: EquipmentPecDeck,
  bicepsMachine: EquipmentBicepsMachine,
  legPress: EquipmentLegPress,
  hackSquat: EquipmentHackSquat,
  squatMachine: EquipmentSquatMachine,
  hipThrustMachine: EquipmentHipThrustMachine,
  legExtension: EquipmentLegExtension,
  lyingLegCurl: EquipmentLyingLegCurl,
  seatedLegCurl: EquipmentSeatedLegCurl,
  calfMachine: EquipmentCalfMachine,
  hipMachine: EquipmentHipMachine,
  backExtension: EquipmentBackExtension,
  none: EquipmentNone,
};
