import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { GYM_EQUIPMENT, type GymEquipment } from "@/shared/types/equipment.types";
import { QUESTION_COUNT } from "../hooks/use-plan-wizard";
import { EQUIPMENT_BY_GROUP, EQUIPMENT_GROUPS } from "../types/equipment-groups";
import { ChoiceCard } from "./ChoiceCard";
import { EquipmentGroupSection } from "./EquipmentGroupSection";
import { WizardQuestion } from "./WizardQuestion";

interface EquipmentStepProps {
  value: readonly GymEquipment[];
  onChange: (equipment: readonly GymEquipment[]) => void;
}

/** Paso 4: el equipo que hay, en casa o en el gimnasio del edificio. Solo se usan ejercicios posibles con él. */
export function EquipmentStep({ value, onChange }: Readonly<EquipmentStepProps>) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const selected = new Set(value);
  const isFullGym = GYM_EQUIPMENT.every((item) => selected.has(item));
  const toggle = (item: GymEquipment) =>
    onChange(selected.has(item) ? value.filter((current) => current !== item) : [...value, item]);

  return (
    <WizardQuestion eyebrow={t("plan.wizard.step", { current: 4, total: QUESTION_COUNT })} title={t("plan.wizard.equipment.title")}>
      <Text style={[styles.hint, { color: c.textSecondary }]}>{t("plan.wizard.equipment.hint")}</Text>
      <ChoiceCard
        title={t("plan.wizard.equipment.fullGym")}
        body={t("plan.wizard.equipment.fullGymBody")}
        isSelected={isFullGym}
        onPress={() => onChange(isFullGym ? [] : GYM_EQUIPMENT)}
      />
      {EQUIPMENT_GROUPS.map((group) => (
        <EquipmentGroupSection key={group} group={group} items={EQUIPMENT_BY_GROUP[group]} selected={selected} onToggle={toggle} />
      ))}
      <View style={styles.none}>
        <ChoiceCard
          title={t("plan.wizard.equipment.none")}
          body={t("plan.wizard.equipment.noneBody")}
          isSelected={value.length === 0}
          onPress={() => onChange([])}
        />
        {value.length === 0 && (
          <Text style={[styles.hint, { color: c.textSecondary }]}>{t("plan.wizard.preview.bodyweight")}</Text>
        )}
      </View>
    </WizardQuestion>
  );
}

const styles = StyleSheet.create({
  hint: getTextStyle("bodySm"),
  none: { gap: tokens.spacing[2] },
});
