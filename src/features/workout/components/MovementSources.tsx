import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { logger } from "@/config/logger";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { MOVEMENT_SOURCE_URLS } from "../data/movement-sources";
import type { MovementSource } from "../types/warmup.types";

const ICON_SIZE = 20;

interface MovementSourcesProps {
  sources: readonly MovementSource[];
}

function openSource(url: string) {
  Linking.openURL(url).catch((error: unknown) => logger.error("Failed to open source", { error, url }));
}

/** De dónde salen la dosis y el momento del movimiento; cada fuente abre su enlace. */
export function MovementSources({ sources }: Readonly<MovementSourcesProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View style={styles.list}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{t("movementInfo.sources")}</Text>
      {sources.map((source) => (
        <Pressable
          key={source}
          accessibilityRole="link"
          accessibilityLabel={t("movementInfo.openSource", { source: t(`movement.source.${source}`) })}
          onPress={() => openSource(MOVEMENT_SOURCE_URLS[source])}
          style={[styles.row, { borderColor: c.border }]}
        >
          <Text style={[styles.text, { color: c.text }]}>{t(`movement.source.${source}`)}</Text>
          <IconRenderer name="external-link" size={ICON_SIZE} color={c.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing[1] },
  label: getTextStyle("label"),
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { ...getTextStyle("bodySm"), flex: 1 },
});
