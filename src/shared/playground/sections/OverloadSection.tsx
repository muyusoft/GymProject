import { Section } from "../components";
import type { PlaygroundColors } from "../types/playground.types";
import { ButtonDemo } from "./overload/ButtonDemo";
import { ControlsDemo } from "./overload/ControlsDemo";
import { ListRowDemo } from "./overload/ListRowDemo";

const OVERLOAD_COMPONENT_COUNT = 6;

interface OverloadSectionProps {
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
}

/** TabBar no se muestra aquí: necesita el estado de navegación y se ve en las tabs reales. */
export function OverloadSection({
  expandedSection,
  setExpandedSection,
  colors,
}: Readonly<OverloadSectionProps>) {
  return (
    <Section
      title="Overload · Components"
      id="overload"
      count={OVERLOAD_COMPONENT_COUNT}
      expandedSection={expandedSection}
      setExpandedSection={setExpandedSection}
      colors={colors}
    >
      <ButtonDemo />
      <ControlsDemo />
      <ListRowDemo />
    </Section>
  );
}
