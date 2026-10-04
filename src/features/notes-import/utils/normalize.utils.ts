import { normalizeText } from "@/shared/utils/search.utils";

const BULLET = /^[-•*–]\s*/;
const SPACES = /\s+/g;

/** Erratas conocidas de las notas: se corrigen con límite de palabra y sin importar mayúsculas. */
const TYPOS: readonly (readonly [RegExp, string])[] = [
  [/\bpresa\b/gi, "press"],
  [/\bpeck\b/gi, "pec"],
  [/\bel polea\b/gi, "en polea"],
];

const STOPWORDS = new Set(["de", "la", "el", "en", "con", "al", "del", "para", "por", "y", "a", "los", "las", "un", "una"]);
const MIN_STEM_LENGTH = 4;

export function cleanLine(raw: string): string {
  return raw.trim().replace(BULLET, "").replace(SPACES, " ");
}

export function fixTypos(text: string): string {
  return TYPOS.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Plural simple: "elevaciones" → "elevacion", "mancuernas" → "mancuerna". Se aplica a ambos lados al comparar. */
export function stemToken(token: string): string {
  if (token.length > MIN_STEM_LENGTH && token.endsWith("es")) return token.slice(0, -2);
  if (token.length >= MIN_STEM_LENGTH && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

/** Palabras que cuentan al comparar nombres: sin acentos, erratas corregidas, sin conectores y en singular. */
export function nameTokens(name: string): string[] {
  return normalizeText(fixTypos(name))
    .replace(/\([^()]*\)/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((token) => token !== "" && !STOPWORDS.has(token))
    .map(stemToken);
}

export function normalizeName(name: string): string {
  return nameTokens(name).join(" ");
}
