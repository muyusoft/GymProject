import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { InlineError } from "./InlineError";

/** Pantalla mínima cuando la base de datos o los ajustes no arrancan. */
export function BootError() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <InlineError message={t("common.bootError")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: tokens.dimensions.screenGutter,
  },
});
