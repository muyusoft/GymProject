import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle } from "@/design/tokens";
import { AsyncStateView, SegmentedControl } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useSettingsStore } from "@/shared/store";
import type { UnitPreference } from "@/shared/types/training.types";
import { useIncrements } from "../hooks/use-increments";
import { IncrementRow } from "./IncrementRow";
import { SettingsSection } from "./SettingsSection";

const UNIT_VALUES: readonly UnitPreference[] = ["lb", "kg", "per_exercise"];

export function UnitsSection() {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const update = useSettingsStore((state) => state.update);
  const { status, increments, reload, changeStep } = useIncrements();

  const options = UNIT_VALUES.map((value) => ({
    value,
    label: t(`settings.weightUnit.${value}`),
  }));

  return (
    <SettingsSection title={t("settings.sections.units")}>
      <Text style={[styles.label, { color: c.text }]}>{t("settings.weightUnit.title")}</Text>
      <SegmentedControl
        options={options}
        value={weightUnit}
        onChange={(value) => void update("weightUnit", value)}
      />
      <Text style={[styles.label, { color: c.text }]}>{t("settings.increment.title")}</Text>
      <AsyncStateView status={status} onRetry={() => void reload()}>
        {increments.map((increment) => (
          <IncrementRow key={increment.id} increment={increment} onChange={changeStep} />
        ))}
      </AsyncStateView>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  label: getTextStyle("title"),
});
