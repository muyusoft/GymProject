import type { IconName } from "@/shared/icons";

export interface PlaygroundColors {
  bgColor: string;
  textColor: string;
  accentColor: string;
  sectionBg: string;
  borderColor: string;
}

export interface PlaygroundState {
  expandedSection: string;
  searchIcons: string;
  iconSize: number;
}

export interface PlaygroundActions {
  setExpandedSection: (id: string) => void;
  setSearchIcons: (query: string) => void;
  setIconSize: (size: number) => void;
}

export interface SectionProps {
  title: string;
  id: string;
  children: React.ReactNode;
  count?: number;
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
}

export interface LabelProps {
  label: string;
  value: string | number;
  colors: PlaygroundColors;
}

export interface ColorPaletteProps {
  name: string;
  colors: Record<string, string>;
  textColor: string;
}

export interface IconGalleryProps {
  filteredIcons: IconName[];
  iconSize: number;
  colors: PlaygroundColors;
  onIconSizeChange: (size: number) => void;
  searchIcons: string;
  onSearchChange: (query: string) => void;
}
