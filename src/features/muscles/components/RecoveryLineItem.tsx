import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import {
  lineDetail,
  lineTitle,
  workedDayLabel,
  type RecoveryTranslate,
} from "../utils/recovery-line.utils";
import type { RecoveryLine } from "../utils/recovery-view.utils";

const ICON_SIZE = 16;
const BAR_HEIGHT = tokens.spacing[1];
const PERCENT = 100;

interface RecoveryLineItemProps {
  line: RecoveryLine;
  /** Color del estado: la barra lo usa, pero el texto dice lo mismo. */
  color: string;
  now: number;
  onPress: (line: RecoveryLine) => void;
}

/** Grupos y día a la derecha; debajo, una barra de cuánto llevan y cuándo estarán listos. Se toca para ver el detalle. */
export function RecoveryLineItem({ line, color, now, onPress }: Readonly<RecoveryLineItemProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const translate: RecoveryTranslate = (key, values) => t(key, values);
  const options = { t: translate, locale: i18n.language, now };
  const title = lineTitle(line, options.t);
  const detail = lineDetail(line, options);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("recovery.detail.open", { groups: title })}
      {...(detail !== null && { accessibilityHint: detail })}
      onPress={() => onPress(line)}
      style={styles.item}
    >
      <View style={styles.top}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: c.textSecondary }]}>{workedDayLabel(line, options)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: c.border }]}>
        <View style={[styles.fill, { backgroundColor: color, width: `${Math.round(line.progress * PERCENT)}%` }]} />
      </View>
      {detail && (
        <View style={styles.detail}>
          <IconRenderer name="timer" size={ICON_SIZE} color={c.textSecondary} />
          <Text style={[styles.meta, styles.detailText, { color: c.textSecondary }]}>{detail}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { gap: tokens.spacing[1], minHeight: tokens.dimensions.minTouch, justifyContent: "center" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: tokens.spacing[3] },
  title: { ...getTextStyle("body"), flex: 1 },
  meta: getTextStyle("bodySm"),
  track: { height: BAR_HEIGHT, borderRadius: tokens.borderRadius.full, overflow: "hidden" },
  fill: { height: BAR_HEIGHT },
  detail: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[1] },
  detailText: { flex: 1 },
});
