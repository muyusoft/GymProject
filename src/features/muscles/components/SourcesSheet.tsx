import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { logger } from "@/config/logger";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import type { SourceInfo } from "../types/muscles.types";

const ICON_SIZE = 20;

interface SourcesSheetProps {
  isVisible: boolean;
  sources: readonly SourceInfo[];
  onClose: () => void;
}

function openSource(url: string) {
  Linking.openURL(url).catch((error: unknown) =>
    logger.error("Failed to open source", { error, url }),
  );
}

/** Hoja con los estudios de los que sale el dato de músculos; cada uno abre su enlace. */
export function SourcesSheet({
  isVisible,
  sources,
  onClose,
}: Readonly<SourcesSheetProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("muscles.sources.close")}
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
      />
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: c.text }]}
        >
          {t("muscles.sources.title")}
        </Text>
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          {t("muscles.sources.hint")}
        </Text>
        {sources.map((source) => (
          <Pressable
            key={source.id}
            accessibilityRole="link"
            accessibilityLabel={t("muscles.sources.open", {
              citation: source.citation,
            })}
            onPress={() => openSource(source.url)}
            style={[styles.row, { backgroundColor: c.surfaceAlt }]}
          >
            <Text style={[styles.citation, { color: c.text }]}>
              {source.citation}
            </Text>
            <IconRenderer
              name="external-link"
              size={ICON_SIZE}
              color={c.info}
            />
          </Pressable>
        ))}
        <Button
          variant="secondary"
          label={t("muscles.sources.close")}
          block
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    gap: tokens.spacing[3],
    padding: tokens.spacing[6],
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  title: getTextStyle("title"),
  hint: getTextStyle("bodySm"),
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
  },
  citation: { ...getTextStyle("body"), flex: 1 },
});
