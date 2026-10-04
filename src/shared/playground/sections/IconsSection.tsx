import { Section, IconGallery } from "../components";
import type { IconName } from "@/shared/icons";
import type { PlaygroundColors } from "../types/playground.types";

interface IconsSectionProps {
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
  filteredIcons: IconName[];
  iconSize: number;
  searchIcons: string;
  onIconSizeChange: (size: number) => void;
  onSearchChange: (query: string) => void;
}

export function IconsSection({
  expandedSection,
  setExpandedSection,
  colors,
  filteredIcons,
  iconSize,
  searchIcons,
  onIconSizeChange,
  onSearchChange,
}: Readonly<IconsSectionProps>) {
  return (
    <Section
      title="🎯 Icons Available"
      id="icons"
      count={filteredIcons.length}
      expandedSection={expandedSection}
      setExpandedSection={setExpandedSection}
      colors={colors}
    >
      <IconGallery
        filteredIcons={filteredIcons}
        iconSize={iconSize}
        colors={colors}
        onIconSizeChange={onIconSizeChange}
        searchIcons={searchIcons}
        onSearchChange={onSearchChange}
      />
    </Section>
  );
}
