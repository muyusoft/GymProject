import { normalizeText } from "@/shared/utils/search.utils";
import type { ParsedLine } from "../types/notes-import.types";
import { parseDuration } from "./duration.utils";
import { detectLoadType } from "./load-type.utils";
import { capitalize, cleanLine, fixTypos } from "./normalize.utils";

const DURATION = String.raw`\d+m\d+s|\d+m|\d+s`;
const REST = new RegExp(String.raw`descansos?\s+(?:de\s+)?(${DURATION})`);
const SETS = new RegExp(
  String.raw`(\d+)\s*series?\s+(?:de\s+)?(${DURATION}|\d+)`,
);
// Cantidades acotadas (hasta 99999,999 y tres espacios): un peso real cabe y la búsqueda no retrocede de más.
const WEIGHT = /(\d{1,5}(?:[.,]\d{1,3})?)\s{0,3}(lbs?|kgs?)\b/;
const PARENTHESES = /\(([^()]*)\)/g;

function splitName(rawName: string): { name: string; note: string | null } {
  const notes = [...rawName.matchAll(PARENTHESES)].map((match) =>
    (match[1] ?? "").trim(),
  );
  const name = fixTypos(
    rawName.replace(PARENTHESES, " ").replace(/\s+/g, " ").trim(),
  );
  return {
    name: capitalize(name),
    note: notes.filter(Boolean).join("; ") || null,
  };
}

interface Extraction {
  match: RegExpExecArray | null;
  remaining: string;
}

/** Saca la primera coincidencia del texto y devuelve lo que sobra (los modificadores de carga). */
function extract(text: string, pattern: RegExp): Extraction {
  return { match: pattern.exec(text), remaining: text.replace(pattern, " ") };
}

/**
 * Una línea: `- nombre: [modificador] peso unidad [modificador] N series de M, descansos [de] XmYs`.
 * Devuelve null si no tiene nombre o no dice cuántas series; el llamador lo reporta como línea no reconocida.
 */
export function parseExerciseLine(
  raw: string,
  lineNumber: number,
): ParsedLine | null {
  const cleaned = cleanLine(raw);
  const colon = cleaned.indexOf(":");
  if (colon <= 0) return null;
  const { name, note } = splitName(cleaned.slice(0, colon));

  const rest = extract(normalizeText(cleaned.slice(colon + 1)), REST);
  const sets = extract(rest.remaining, SETS);
  if (!name || !sets.match) return null;
  const weight = extract(sets.remaining, WEIGHT);

  const work = sets.match[2] ?? "";
  const seconds = parseDuration(work);
  const isTimed = seconds !== null;
  const weightMatch = isTimed ? null : weight.match;
  const unit = weightMatch ? getUnit(weightMatch[2] ?? "") : null;
  return {
    lineNumber,
    raw: raw.trim(),
    name,
    note,
    weight: weightMatch
      ? Number((weightMatch[1] ?? "").replace(",", "."))
      : null,
    unit,
    loadType: detectLoadType({
      modifiers: weight.remaining,
      hasWeight: weightMatch !== null,
      isTimed,
    }),
    sets: Number(sets.match[1]),
    reps: isTimed ? null : Number(work),
    seconds,
    restSec: rest.match ? parseDuration(rest.match[1] ?? "") : null,
  };
}

function getUnit(rawUnit: string): "lb" | "kg" {
  return rawUnit.startsWith("lb") ? "lb" : "kg";
}
