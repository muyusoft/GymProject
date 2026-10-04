import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@/design/tokens";
import { Chip } from "@/shared/components";
import { LOAD_TYPES, type LoadType } from "@/shared/types/training.types";

interface LoadTypeChipsProps {
  value: LoadType;
  onChange: (loadType: LoadType) => void;
}

export function LoadTypeChips({ value, onChange }: Readonly<LoadTypeChipsProps>) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      {LOAD_TYPES.map((loadType) => (
        <Chip
          key={loadType}
          label={t(`plan.loadType.${loadType}`)}
          selected={loadType === value}
          onPress={() => onChange(loadType)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[2] },
});
