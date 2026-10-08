import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { MuscleGroup } from "@/shared/types/training.types";
import { formatNumber } from "@/shared/utils/weight.utils";
import type { VolumeTier } from "../utils/muscle-volume.utils";

const LOW_BORDER_WIDTH = 2;

interface VolumeTileProps {
  group: MuscleGroup;
  sets: number;
  tier: VolumeTier;
}

/** El nivel va en fondo y borde, pero el número de series siempre está en texto. */
export function VolumeTile({ group, sets, tier }: Readonly<VolumeTileProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const colors = {
    high: { background: c.accent, text: c.onAccent, border: c.accent },
    mid: { background: c.surfaceAlt, text: c.text, border: c.accentText },
    low: { background: c.surfaceAlt, text: c.text, border: c.info },
  }[tier];

  const groupLabel = t(`muscles.group.${group}`);

  return (
    <View
      accessible
      accessibilityLabel={`${groupLabel}: ${t("muscles.volume.sets", { count: sets })}`}
      style={[
        styles.tile,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        {t(`muscles.group.${group}`)}
      </Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {formatNumber(sets, i18n.language)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.borderRadius.md,
    borderWidth: LOW_BORDER_WIDTH,
  },
  label: { ...getTextStyle("title"), flexShrink: 1 },
  value: getTextStyle("numeric"),
});
