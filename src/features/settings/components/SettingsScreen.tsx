import { ScrollView, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { AppearanceSection } from "./AppearanceSection";
import { DataSection } from "./DataSection";
import { ProgressionSection } from "./ProgressionSection";
import { ReminderSection } from "./ReminderSection";
import { UnitsSection } from "./UnitsSection";

export function SettingsScreen() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.text }]}>{t("settings.title")}</Text>
      <UnitsSection />
      <ProgressionSection />
      <ReminderSection />
      <AppearanceSection />
      <DataSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: tokens.spacing[6],
    padding: tokens.dimensions.screenGutter,
    paddingBottom: tokens.spacing[12],
  },
  title: getTextStyle("displayLg"),
});
