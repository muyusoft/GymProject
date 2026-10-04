import { useTranslation } from "react-i18next";
import { Toggle } from "@/shared/components";
import { useSettingsStore } from "@/shared/store";
import { SettingsSection } from "./SettingsSection";

export function ProgressionSection() {
  const { t } = useTranslation();
  const progressionSuggestions = useSettingsStore((state) => state.progressionSuggestions);
  const trackRpe = useSettingsStore((state) => state.trackRpe);
  const autoDeload = useSettingsStore((state) => state.autoDeload);
  const update = useSettingsStore((state) => state.update);

  return (
    <SettingsSection title={t("settings.sections.progression")}>
      <Toggle
        label={t("settings.progression.suggestions")}
        value={progressionSuggestions}
        onChange={(value) => void update("progressionSuggestions", value)}
      />
      <Toggle
        label={t("settings.progression.rpe")}
        description={t("settings.progression.rpeHint")}
        value={trackRpe}
        onChange={(value) => void update("trackRpe", value)}
      />
      <Toggle
        label={t("settings.progression.deload")}
        description={t("settings.progression.deloadHint")}
        value={autoDeload}
        onChange={(value) => void update("autoDeload", value)}
      />
    </SettingsSection>
  );
}
