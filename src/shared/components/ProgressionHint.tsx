import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import IconRenderer from "@/shared/icons/icon-renderer";
import { Button } from "./Button";

const BAR_WIDTH = 4;
const ICON_SIZE = 20;

export type ProgressionHintKind = "increase" | "deload";

interface ProgressionHintProps {
  kind: ProgressionHintKind;
  message: string;
  onDismiss: () => void;
  /** Con acción, la sugerencia se acepta o se deja para otro día; sin ella solo informa y se cierra. */
  action?: { label: string; onPress: () => void };
}

/** Subir peso en volt, descarga en info; siempre se puede descartar y nunca cambia el plan. */
export function ProgressionHint({
  kind,
  message,
  onDismiss,
  action,
}: Readonly<ProgressionHintProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const isIncrease = kind === "increase";
  const tone = isIncrease ? c.accent : c.info;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderLeftColor: tone },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: tone }]}>
          <IconRenderer
            name={isIncrease ? "arrow-up" : "trending-down"}
            size={ICON_SIZE}
            color={c.onAccent}
          />
        </View>
        <Text style={[styles.message, { color: c.text }]}>{message}</Text>
        {!action && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("hint.dismiss")}
            onPress={onDismiss}
            style={styles.dismiss}
          >
            <IconRenderer name="x" size={ICON_SIZE} color={c.textSecondary} />
          </Pressable>
        )}
      </View>
      {action && (
        <View style={styles.actions}>
          <Button
            variant={isIncrease ? "primary" : "secondary"}
            label={action.label}
            onPress={action.onPress}
          />
          <Button
            variant="ghost"
            label={t("hint.notNow")}
            onPress={onDismiss}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingLeft: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    borderLeftWidth: BAR_WIDTH,
  },
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[3] },
  icon: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    borderRadius: tokens.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    ...getTextStyle("bodySm"),
    flex: 1,
    paddingVertical: tokens.spacing[3],
  },
  dismiss: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[2],
    paddingRight: tokens.spacing[3],
    paddingBottom: tokens.spacing[3],
  },
});
