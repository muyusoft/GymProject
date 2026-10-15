import type { GymEquipment } from "@/shared/types/equipment.types";

export const EQUIPMENT_GROUPS = ["freeWeights", "bars", "upperMachines", "lowerMachines"] as const;
export type EquipmentGroup = (typeof EQUIPMENT_GROUPS)[number];

/** Cómo se agrupa el equipo en la pantalla; el orden es el de los mosaicos. */
export const EQUIPMENT_BY_GROUP: Record<EquipmentGroup, readonly GymEquipment[]> = {
  freeWeights: ["dumbbells", "barbell", "kettlebell", "adjustableBench", "benchPress", "rack", "smith", "tBarRow", "preacherBench"],
  bars: ["pullUpBar", "powerTower", "trx", "bands"],
  upperMachines: ["cableTower", "latPulldown", "seatedRow", "chestSupportedRow", "chestPress", "shoulderPress", "pecDeck", "bicepsMachine"],
  lowerMachines: [
    "legPress",
    "hackSquat",
    "squatMachine",
    "hipThrustMachine",
    "legExtension",
    "lyingLegCurl",
    "seatedLegCurl",
    "calfMachine",
    "hipMachine",
    "backExtension",
  ],
};
