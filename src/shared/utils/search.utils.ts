const DIACRITICS = /[̀-ͯ]/g;

/** Minúsculas sin acentos, para buscar "traccion" y encontrar "Tracción". */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}
