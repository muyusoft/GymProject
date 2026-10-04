import { normalizeText } from "@/shared/utils/search.utils";
import type { PickerItem } from "./progress-view.utils";

/** Filtra el selector por nombre en español o inglés, sin importar acentos ni mayúsculas. */
export function filterPickerItems(items: readonly PickerItem[], query: string): PickerItem[] {
  const needle = normalizeText(query);
  if (!needle) return [...items];
  return items.filter((item) => [item.nameEs, item.nameEn].some((name) => normalizeText(name).includes(needle)));
}
