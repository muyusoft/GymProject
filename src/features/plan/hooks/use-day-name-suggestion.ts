import { useTranslation } from "react-i18next";
import type { DayNameSuggestion } from "../utils/day-name.utils";

/** La sugerencia en texto, en el idioma actual: "Pecho y tríceps", "Cuerpo completo"… */
export function useDayNameSuggestion(suggestion: DayNameSuggestion | null): string | null {
  const { t, i18n } = useTranslation();
  if (!suggestion) return null;
  if (suggestion.kind === "fullBody") return t("plan.day.suggest.fullBody");

  const [first, second, third] = suggestion.parts.map((part, position) => {
    const name = t(`plan.day.suggest.focus.${part}`);
    return position === 0 ? name : name.toLocaleLowerCase(i18n.language);
  });
  if (first === undefined) return null;
  if (second === undefined) return first;
  if (third === undefined) return t("plan.day.suggest.two", { first, second });
  return t("plan.day.suggest.three", { first, second, third });
}
