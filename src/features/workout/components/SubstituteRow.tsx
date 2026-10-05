import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { ExerciseInfoButton } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import type { SubstituteCandidate } from "../types/workout.types";

const ICON_SIZE = 20;

interface SubstituteRowProps {
  candidate: SubstituteCandidate;
  isSelected: boolean;
  onSelect: (exerciseId: string) => void;
  /** La hoja tapa la ficha: se oculta antes de abrirla. */
  onOpenInfo: () => void;
}

/** Una alternativa con el motivo en texto (mismo movimiento o mismo músculo) y si ya se hizo antes. */
export function SubstituteRow({ candidate, isSelected, onSelect, onOpenInfo }: Readonly<SubstituteRowProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const name = getExerciseName(candidate, i18n.language);
  const reason = t(`substitute.reason.${candidate.reason ?? "search"}`, { equipment: t(`equipment.${candidate.equipment}`) });
  const detail = candidate.hasHistory ? t("substitute.withHistory", { reason }) : reason;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${detail}`}
      accessibilityState={{ selected: isSelected }}
      onPress={() => onSelect(candidate.exerciseId)}
      style={[styles.row, { backgroundColor: isSelected ? c.surfaceAlt : c.surface, borderColor: isSelected ? c.text : c.border }]}
    >
      <View style={styles.texts}>
        <Text style={[styles.name, { color: c.text }]}>{name}</Text>
        <Text style={[styles.detail, { color: c.textSecondary }]}>{detail}</Text>
      </View>
      {isSelected && <IconRenderer name="check" size={ICON_SIZE} color={c.text} />}
      <ExerciseInfoButton exerciseId={candidate.exerciseId} name={name} onBeforeOpen={onOpenInfo} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: tokens.dimensions.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  texts: { flex: 1 },
  name: getTextStyle("title"),
  detail: getTextStyle("bodySm"),
});
