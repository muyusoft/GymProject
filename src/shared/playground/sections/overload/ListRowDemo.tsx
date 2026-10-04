import { Text } from "react-native";
import { getTextStyle } from "@/design/tokens";
import { ListRow } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { DemoGroup } from "./DemoGroup";

const noop = () => undefined;

export function ListRowDemo() {
  const { c } = useOverloadTheme();

  return (
    <DemoGroup title="ListRow · normal / con acción / arrastrando">
      <ListRow title="Press de banca" subtitle="4 × 8 · 80 kg" />
      <ListRow
        title="Remo con barra"
        subtitle="4 × 10 · 60 kg"
        onPress={noop}
        trailing={<Text style={[getTextStyle("numeric"), { color: c.text }]}>60</Text>}
      />
      <ListRow title="Sentadilla" subtitle="Reordenable" hasDragHandle />
      <ListRow title="Peso muerto" subtitle="Arrastrando" hasDragHandle isDragging />
    </DemoGroup>
  );
}
