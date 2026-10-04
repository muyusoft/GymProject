import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { useBackup } from "../hooks/use-backup";
import { SettingsSection } from "./SettingsSection";

const ICON_SIZE = 20;

/** Exportar el plan y el historial a un JSON y volver a importarlo; importar reemplaza lo actual y pide confirmar. */
export function DataSection() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const backup = useBackup();
  const { notice, pending } = backup;

  return (
    <SettingsSection title={t("settings.sections.data")}>
      <Text style={[styles.hint, { color: c.textSecondary }]}>{t("settings.data.hint")}</Text>
      <Button
        variant="secondary"
        label={t("settings.data.export")}
        icon="download"
        block
        loading={backup.isWorking}
        disabled={pending !== null}
        onPress={() => void backup.exportData()}
      />
      <Button
        variant="secondary"
        label={t("settings.data.import")}
        icon="upload"
        block
        disabled={backup.isWorking || pending !== null}
        onPress={() => void backup.startImport()}
      />
      {pending && (
        <View style={[styles.confirm, { backgroundColor: c.surfaceAlt }]}>
          <Text style={[styles.confirmTitle, { color: c.text }]}>{t("settings.data.confirmTitle")}</Text>
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            {t("settings.data.confirmBody", {
              days: pending.summary.days,
              sessions: pending.summary.sessions,
              sets: pending.summary.sets,
            })}
          </Text>
          <Button
            variant="danger"
            label={t("settings.data.replace")}
            block
            loading={backup.isWorking}
            onPress={() => void backup.confirmImport()}
          />
          <Button
            variant="ghost"
            label={t("common.cancel")}
            block
            disabled={backup.isWorking}
            onPress={backup.cancelImport}
          />
        </View>
      )}
      {notice?.kind === "error" && <InlineError message={t(notice.key)} />}
      {notice?.kind === "success" && (
        <View accessibilityLiveRegion="polite" style={styles.success}>
          <IconRenderer name="circle-check" size={ICON_SIZE} color={c.accentText} />
          <Text style={[styles.hint, { color: c.text }]}>{t(notice.key, notice.params ?? {})}</Text>
        </View>
      )}
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  hint: getTextStyle("bodySm"),
  confirm: { gap: tokens.spacing[3], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.md },
  confirmTitle: getTextStyle("title"),
  success: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
});
