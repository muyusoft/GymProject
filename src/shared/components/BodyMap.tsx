import { StyleSheet, Text, View } from "react-native";
import Body from "react-native-body-highlighter";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { buildBodyParts, type BodySide, type GroupPaintMap } from "@/shared/utils/body-map.utils";

const BODY_SCALE = 0.8;
const SIDES: readonly BodySide[] = ["front", "back"];

interface BodyMapProps {
  mode: "recovery" | "exercise";
  /** Qué grupos se pintan, de qué color y en qué vista. Lo que no está aquí no se pinta. */
  groups: GroupPaintMap;
  gender?: "male" | "female";
}

/**
 * Figura de frente y de espalda (react-native-body-highlighter, MIT). Es solo un apoyo visual:
 * cada pantalla debe mostrar debajo el estado en texto.
 */
export function BodyMap({ mode, groups, gender = "male" }: Readonly<BodyMapProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t(`bodyMap.${mode}`)} style={styles.row}>
      {SIDES.map((side) => (
        <View key={side} style={styles.side} importantForAccessibility="no-hide-descendants">
          <Body
            data={buildBodyParts(groups, side)}
            side={side}
            gender={gender}
            scale={BODY_SCALE}
            border={c.border}
            defaultFill={c.muscleIdle}
            defaultStroke={c.border}
          />
          <Text style={[styles.label, { color: c.textSecondary }]}>{t(`bodyMap.${side}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-around" },
  side: { alignItems: "center", gap: tokens.spacing[2] },
  label: getTextStyle("label"),
});
