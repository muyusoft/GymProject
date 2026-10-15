import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import type { GymEquipment } from "@/shared/types/equipment.types";
import { chunk } from "@/shared/utils/chunk.utils";
import type { EquipmentGroup } from "../types/equipment-groups";
import { EquipmentTile } from "./EquipmentTile";

const COLUMNS = 2;
const GAP = tokens.spacing[2];
/** Lo que el mosaico ocupa alrededor de la ilustración: su relleno y el del recuadro, a cada lado. */
const TILE_INSET = (tokens.spacing[3] + tokens.spacing[2]) * 2;

interface EquipmentGroupSectionProps {
  group: EquipmentGroup;
  items: readonly GymEquipment[];
  selected: ReadonlySet<GymEquipment>;
  onToggle: (item: GymEquipment) => void;
}

/** Un grupo de equipo en dos columnas. */
export function EquipmentGroupSection({ group, items, selected, onToggle }: Readonly<EquipmentGroupSectionProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const { width } = useWindowDimensions();
  const tileWidth = (width - tokens.dimensions.screenGutter * 2 - GAP) / COLUMNS;

  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={[styles.title, { color: c.textSecondary }]}>
        {t(`plan.wizard.equipment.groups.${group}`)}
      </Text>
      {chunk(items, COLUMNS).map((row) => (
        <View key={row.join("-")} style={styles.row}>
          {row.map((item) => (
            <EquipmentTile
              key={item}
              name={item}
              label={t(`plan.wizard.equipment.items.${item}`)}
              isSelected={selected.has(item)}
              illustrationWidth={tileWidth - TILE_INSET}
              onPress={() => onToggle(item)}
            />
          ))}
          {row.length < COLUMNS && <View style={styles.spacer} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: GAP },
  title: getTextStyle("label"),
  row: { flexDirection: "row", gap: GAP },
  spacer: { flex: 1 },
});
