import { Pressable, StyleSheet, Text, View } from "react-native";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useIllustrationTones } from "@/shared/hooks/use-illustration-tones";
import { EquipmentIllustration, type EquipmentIllustrationName } from "@/shared/icons";
import { IconRenderer } from "@/shared/icons/icon-renderer";

const CHECK_SIZE = 14;
const SELECTED_BORDER = 2;

interface EquipmentTileProps {
  name: EquipmentIllustrationName;
  label: string;
  isSelected: boolean;
  /** Ancho de la ilustración; el mosaico la rodea con su relleno. */
  illustrationWidth: number;
  onPress: () => void;
}

/** Un equipo para marcar: su ilustración, el nombre y un check (marcado = borde claro y check, no solo color). */
export function EquipmentTile({ name, label, isSelected, illustrationWidth, onPress }: Readonly<EquipmentTileProps>) {
  const { c } = useOverloadTheme();
  const tones = useIllustrationTones();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: c.surface,
          borderColor: isSelected ? c.text : c.border,
          borderWidth: isSelected ? SELECTED_BORDER : StyleSheet.hairlineWidth * 2,
        },
      ]}
    >
      <View style={[styles.art, { backgroundColor: c.background }]}>
        <EquipmentIllustration name={name} width={illustrationWidth} tones={tones} />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
        <View
          style={[
            styles.check,
            isSelected ? { backgroundColor: c.text } : { borderColor: c.border, borderWidth: SELECTED_BORDER },
          ]}
        >
          {isSelected && <IconRenderer name="check" size={CHECK_SIZE} color={c.background} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: tokens.spacing[2], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.lg },
  art: { alignItems: "center", padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md },
  footer: { flexDirection: "row", alignItems: "flex-end", gap: tokens.spacing[2] },
  label: { ...getTextStyle("bodySm"), fontFamily: tokens.typography.fontFamily.sansSemibold, flex: 1 },
  check: {
    width: tokens.spacing[6],
    height: tokens.spacing[6],
    borderRadius: tokens.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
