import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components";
import { SettingsSection } from "./SettingsSection";

/** Volver a ver la introducción; al terminarla o saltarla se regresa a Ajustes. */
export function HelpSection() {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t("settings.sections.help")}>
      <Button
        variant="secondary"
        label={t("settings.help.replayIntro")}
        icon="info"
        block
        onPress={() => router.push({ pathname: "/intro", params: { replay: "1" } })}
      />
    </SettingsSection>
  );
}
