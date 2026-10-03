import { useState } from "react";
import type {
  PlaygroundState,
  PlaygroundActions,
} from "../types/playground.types";

const INITIAL_ICON_SIZE = 32;
const INITIAL_EXPANDED_SECTION = "icons";

export function usePlaygroundState(): PlaygroundState & PlaygroundActions {
  const [expandedSection, setExpandedSection] = useState<string>(
    INITIAL_EXPANDED_SECTION,
  );
  const [searchIcons, setSearchIcons] = useState("");
  const [iconSize, setIconSize] = useState(INITIAL_ICON_SIZE);

  return {
    expandedSection,
    searchIcons,
    iconSize,
    setExpandedSection,
    setSearchIcons,
    setIconSize,
  };
}
