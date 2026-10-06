/**
 * Ids que salen del contenido y no del azar. Dos teléfonos de la misma cuenta deben llamar igual a la
 * misma fila para poder sincronizar: el press de banca del catálogo, el salto de las mancuernas en lb,
 * el peso corporal de un día o la sustitución de un ejercicio en una fecha.
 */

const DIACRITICS = /[̀-ͯ]/g;
const NOT_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const CATALOG_PREFIX = "fedb:";
const COMMON_PREFIX = "common:";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(NOT_ALPHANUMERIC, "-")
    .replace(EDGE_DASHES, "");
}

/** Ejercicio que viene de free-exercise-db: "fedb:Barbell_Squat". */
export function catalogExerciseId(sourceId: string): string {
  return `${CATALOG_PREFIX}${sourceId}`;
}

/** Ejercicio propio del catálogo, sin equivalente en free-exercise-db: "common:reverse-pec-deck". */
export function commonExerciseId(nameEs: string): string {
  return `${COMMON_PREFIX}${slugify(nameEs)}`;
}

export function incrementId(equipment: string, unit: string): string {
  return `${equipment}:${unit}`;
}

/** Hay un solo registro de peso corporal por día, así que la fecha (yyyy-MM-dd) es su id. */
export function bodyWeightId(date: string): string {
  return date;
}

/** Una sustitución por ejercicio del plan y fecha. */
export function swapId(date: string, planExerciseId: string): string {
  return `${date}:${planExerciseId}`;
}
