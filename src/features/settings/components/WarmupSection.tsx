import { useTranslation } from "react-i18next";
import { Toggle } from "@/shared/components";
import { useSettingsStore } from "@/shared/store";
import { SettingsSection } from "./SettingsSection";

/** Calentamiento (con aproximación) antes de entrenar y estiramientos al terminar; ambos opcionales. */
export function WarmupSection() {
  const { t } = useTranslation();
  const warmupEnabled = useSettingsStore((state) => state.warmupEnabled);
  const stretchEnabled = useSettingsStore((state) => state.stretchEnabled);
  const update = useSettingsStore((state) => state.update);

  return (
    <SettingsSection title={t("settings.sections.warmup")}>
      <Toggle
        label={t("settings.warmup.warmup")}
        description={t("settings.warmup.warmupHint")}
        value={warmupEnabled}
        onChange={(value) => void update("warmupEnabled", value)}
      />
      <Toggle
        label={t("settings.warmup.stretch")}
        description={t("settings.warmup.stretchHint")}
        value={stretchEnabled}
        onChange={(value) => void update("stretchEnabled", value)}
      />
    </SettingsSection>
  );
}
