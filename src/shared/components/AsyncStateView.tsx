import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import type { ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSyncStore } from "@/shared/store/sync.store";
import { Button } from "./Button";

interface AsyncStateViewProps {
  status: ResourceStatus;
  onRetry: () => void;
  children: ReactNode;
}

/**
 * Estados de carga y error compartidos; el vacío lo decide cada pantalla. Mientras se bajan los datos de
 * la cuenta a un teléfono vacío también muestra carga, para no enseñar un "no tienes nada" que no es cierto.
 */
export function AsyncStateView({
  status,
  onRetry,
  children,
}: Readonly<AsyncStateViewProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  const isRestoring = useSyncStore((state) => state.isRestoring);
  const isLoading = status === "loading" || (isRestoring && status === "ready");

  if (status === "ready" && !isRestoring) return <>{children}</>;

  return (
    <View style={styles.center}>
      {isLoading ? (
        <>
          <ActivityIndicator
            size="large"
            accessibilityLabel={t(
              isRestoring ? "sync.restoring" : "common.loading",
            )}
            color={c.textSecondary}
          />
          {isRestoring && (
            <Text style={[styles.message, { color: c.textSecondary }]}>
              {t("sync.restoring")}
            </Text>
          )}
        </>
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
