import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import type { ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { Button } from "./Button";

interface AsyncStateViewProps {
  status: ResourceStatus;
  onRetry: () => void;
  children: ReactNode;
}

/** Estados de carga y error compartidos; el vacío lo decide cada pantalla. */
export function AsyncStateView({
  status,
  onRetry,
  children,
}: Readonly<AsyncStateViewProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  if (status === "ready") return <>{children}</>;

  return (
    <View style={styles.center}>
      {status === "loading" ? (
        <ActivityIndicator
          accessibilityLabel={t("common.loading")}
          color={c.textSecondary}
        />
      ) : (
        <>
          <Text style={[styles.message, { color: c.text }]}>
            {t("common.error")}
          </Text>
          <View style={styles.action}>
            <Button
              variant="secondary"
              label={t("common.retry")}
              onPress={onRetry}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[4],
    padding: tokens.spacing[6],
  },
  message: getTextStyle("body"),
  // Button fija alignSelf: en fila, el centrado horizontal lo decide este contenedor.
  action: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
});
