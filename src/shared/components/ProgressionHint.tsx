import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";

const BAR_WIDTH = 4;
const ICON_SIZE = 20;

export type ProgressionHintKind = "increase" | "deload";

interface ProgressionHintProps {
  kind: ProgressionHintKind;
  message: string;
  onDismiss: () => void;
}

/** Subir peso en volt, descarga en info; siempre se puede descartar y nunca cambia el plan. */
export function ProgressionHint({ kind, message, onDismiss }: ProgressionHintProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const isIncrease = kind === "increase";
  const tone = isIncrease ? c.accent : c.info;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderLeftColor: tone }]}>
      <View style={[styles.icon, { backgroundColor: tone }]}>
        <IconRenderer
          name={isIncrease ? "arrow-up" : "trending-down"}
          size={ICON_SIZE}
          color={c.onAccent}
        />
      </View>
      <Text style={[styles.message, { color: c.text }]}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("hint.dismiss")}
        onPress={onDismiss}
        style={styles.dismiss}
      >
        <IconRenderer name="x" size={ICON_SIZE} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingLeft: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    borderLeftWidth: BAR_WIDTH,
  },
  icon: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  message: { ...getTextStyle("bodySm"), flex: 1, paddingVertical: tokens.spacing[3] },
  dismiss: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});
