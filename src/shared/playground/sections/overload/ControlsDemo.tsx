import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { tokens } from "@/design/tokens";
import { Chip, SegmentedControl, Stepper, Toggle } from "@/shared/components";
import { DemoGroup } from "./DemoGroup";

const UNIT_OPTIONS = [
  { value: "lb", label: "lb" },
  { value: "kg", label: "kg" },
] as const;

const WEIGHT_MIN = 0;
const WEIGHT_MAX = 20;
const WEIGHT_STEP = 2.5;

export function ControlsDemo() {
  const [weight, setWeight] = useState(10);
  const [atMin, setAtMin] = useState(WEIGHT_MIN);
  const [atMax, setAtMax] = useState(WEIGHT_MAX);
  const [unit, setUnit] = useState<(typeof UNIT_OPTIONS)[number]["value"]>("lb");
  const [isAutoIncrease, setIsAutoIncrease] = useState(true);
  const [isReminder, setIsReminder] = useState(false);
  const [isChipOn, setIsChipOn] = useState(true);
  const [isChipOff, setIsChipOff] = useState(false);

  return (
    <>
      <DemoGroup title="Stepper · normal / en el límite">
        <Stepper value={weight} step={WEIGHT_STEP} min={WEIGHT_MIN} max={WEIGHT_MAX} unit="kg" onChange={setWeight} />
        <Stepper value={atMin} step={WEIGHT_STEP} min={WEIGHT_MIN} max={WEIGHT_MAX} unit="kg" onChange={setAtMin} />
        <Stepper value={atMax} step={WEIGHT_STEP} min={WEIGHT_MIN} max={WEIGHT_MAX} unit="kg" onChange={setAtMax} />
      </DemoGroup>
      <DemoGroup title="SegmentedControl">
        <SegmentedControl options={UNIT_OPTIONS} value={unit} onChange={setUnit} />
      </DemoGroup>
      <DemoGroup title="Chip · seleccionado / no seleccionado">
        <View style={styles.chips}>
          <Chip label="Pecho" selected={isChipOn} onPress={() => setIsChipOn(!isChipOn)} />
          <Chip label="Espalda" selected={isChipOff} onPress={() => setIsChipOff(!isChipOff)} />
        </View>
      </DemoGroup>
      <DemoGroup title="Toggle · activado / desactivado">
        <Toggle label="Subir peso" description="Sugiere subir tras 2 sesiones" value={isAutoIncrease} onChange={setIsAutoIncrease} />
        <Toggle label="Recordatorios" value={isReminder} onChange={setIsReminder} />
      </DemoGroup>
    </>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", gap: tokens.spacing[2] },
});
