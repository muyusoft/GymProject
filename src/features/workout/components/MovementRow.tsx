import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { openMovementInfo } from "../services/movement-navigation.service";
import type { Movement } from "../types/warmup.types";
import { doseKey } from "../utils/movement-dose.utils";

const ICON_SIZE = 24;

interface MovementRowProps {
  movement: Movement;
  isDone: boolean;
  onToggle: (id: string) => void;
}

/**
 * Un movimiento de la lista: nombre, dosis y equipo; tocarlo lo marca como hecho (con icono, no solo color).
 * El botón de información abre su ficha.
 */
export function MovementRow({
  movement,
  isDone,
  onToggle,
}: Readonly<MovementRowProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const { key, count } = doseKey(movement.dose);
  const name = t(`movement.${movement.id}.name`);
  const dose = t(`movement.dose.${key}`, { count });
  const equipment = t(
    movement.needsBand ? "warmup.band" : "warmup.noEquipment",
  );

  return (
    <View style={[styles.row, { borderColor: c.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("warmup.howTo", { name })}
        onPress={() => openMovementInfo(movement.id)}
        style={styles.info}
      >
        <IconRenderer name="info" size={ICON_SIZE} color={c.textSecondary} />
      </Pressable>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={t("warmup.rowLabel", { name, dose, equipment })}
        onPress={() => onToggle(movement.id)}
        style={styles.toggle}
      >
        <View style={styles.texts}>
          <Text
            style={[styles.name, { color: isDone ? c.textSecondary : c.text }]}
          >
            {name}
          </Text>
          <Text style={[styles.detail, { color: c.textSecondary }]}>
            {dose} · {equipment}
          </Text>
        </View>
        <IconRenderer
          name={isDone ? "circle-check" : "check"}
          size={ICON_SIZE}
          color={isDone ? c.text : c.border}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  toggle: {
    flex: 1,
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingVertical: tokens.spacing[3],
  },
  texts: { flex: 1 },
  name: getTextStyle("body"),
  detail: getTextStyle("bodySm"),
});
