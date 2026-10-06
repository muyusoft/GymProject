import { Alert, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle } from "@/design/tokens";
import { Button, InlineError } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import {
  requestSync,
  resolveSyncChoice,
} from "@/shared/services/sync/sync.service";
import { useSyncStore } from "@/shared/store";
import { dateUtils } from "@/shared/utils";

/** Estado de la copia en la nube: cuándo se sincronizó, si falló o si falta elegir con qué datos quedarse. */
export function AccountSyncStatus() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const status = useSyncStore((state) => state.status);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);

  const askChoice = () => {
    Alert.alert(t("sync.choice.title"), t("sync.choice.message"), [
      {
        text: t("sync.choice.keepPhone"),
        onPress: () => void resolveSyncChoice("phone"),
      },
      {
        text: t("sync.choice.keepAccount"),
        onPress: () => void resolveSyncChoice("account"),
      },
      { text: t("sync.choice.later"), style: "cancel" },
    ]);
  };

  if (status === "needsChoice") {
    return (
      <>
        <InlineError message={t("settings.account.needsChoice")} />
        <Button
          label={t("settings.account.choose")}
          block
          onPress={askChoice}
        />
      </>
    );
  }

  const summary =
    lastSyncedAt === null
      ? t("settings.account.neverSynced")
      : t("settings.account.synced", {
          time: dateUtils.formatTime(new Date(lastSyncedAt)),
        });

  return (
    <>
      {status === "error" ? (
        <InlineError message={t("settings.account.syncError")} />
      ) : (
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          {status === "syncing" ? t("settings.account.syncing") : summary}
        </Text>
      )}
      <Button
        variant="secondary"
        label={t("settings.account.syncNow")}
        icon="repeat"
        block
        loading={status === "syncing"}
        onPress={() => void requestSync()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hint: getTextStyle("bodySm"),
});
