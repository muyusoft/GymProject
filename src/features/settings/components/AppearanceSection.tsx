import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle } from "@/design/tokens";
import { SegmentedControl } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSettingsStore } from "@/shared/store";
import { LANGUAGES } from "@/shared/types/settings.types";
import type { ThemePreference } from "@/shared/utils/color-mode.utils";
import { SettingsSection } from "./SettingsSection";

const THEME_VALUES: readonly ThemePreference[] = ["auto", "dark", "light"];

export function AppearanceSection() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const language = useSettingsStore((state) => state.language);
  const theme = useSettingsStore((state) => state.theme);
  const update = useSettingsStore((state) => state.update);

  const languageOptions = LANGUAGES.map((value) => ({
    value,
    label: t(`settings.languageName.${value}`),
  }));
  const themeOptions = THEME_VALUES.map((value) => ({
    value,
    label: t(`settings.themeName.${value}`),
  }));

  return (
    <SettingsSection title={t("settings.sections.appearance")}>
      <Text style={[styles.label, { color: c.text }]}>{t("settings.language")}</Text>
      <SegmentedControl
        options={languageOptions}
        value={language}
        onChange={(value) => void update("language", value)}
      />
      <Text style={[styles.label, { color: c.text }]}>{t("settings.theme")}</Text>
      <SegmentedControl
        options={themeOptions}
        value={theme}
        onChange={(value) => void update("theme", value)}
      />
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  label: getTextStyle("title"),
});
