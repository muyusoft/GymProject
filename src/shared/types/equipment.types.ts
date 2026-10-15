/**
 * El equipo que una persona puede marcar en "Crear un plan para mí". Cada ejercicio del catálogo dice qué
 * combinaciones de este equipo le sirven (`requires`); el generador solo usa los que se pueden hacer.
 */
export const GYM_EQUIPMENT = [
  // Peso libre
  "dumbbells",
  "barbell",
  "kettlebell",
  "adjustableBench",
  "benchPress",
  "rack",
  "smith",
  "tBarRow",
  "preacherBench",
  // Barras y suspensión
  "pullUpBar",
  "powerTower",
  "trx",
  "bands",
  // Máquinas de tren superior
  "cableTower",
  "latPulldown",
  "seatedRow",
  "chestSupportedRow",
  "chestPress",
  "shoulderPress",
  "pecDeck",
  "bicepsMachine",
  // Máquinas de tren inferior
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
] as const;
export type GymEquipment = (typeof GYM_EQUIPMENT)[number];

/**
 * Qué necesita un ejercicio: alguna de estas combinaciones, y de cada una, todo su equipo.
 * `[[]]` = nada (peso corporal). null = sin dato: el generador no lo usa.
 */
export type EquipmentRequirements = readonly (readonly GymEquipment[])[] | null;
