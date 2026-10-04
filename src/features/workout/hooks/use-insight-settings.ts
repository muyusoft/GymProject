import { useMemo } from "react";
import { useSettingsStore } from "@/shared/store";
import type { InsightSettings } from "../utils/insight.utils";

/** Los tres interruptores de progresión de Ajustes, en un objeto estable entre renders. */
export function useInsightSettings(): InsightSettings {
  const progressionSuggestions = useSettingsStore((state) => state.progressionSuggestions);
  const trackRpe = useSettingsStore((state) => state.trackRpe);
  const autoDeload = useSettingsStore((state) => state.autoDeload);

  return useMemo(
    () => ({ progressionSuggestions, trackRpe, autoDeload }),
    [progressionSuggestions, trackRpe, autoDeload],
  );
}
