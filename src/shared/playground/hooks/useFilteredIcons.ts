import { useMemo } from "react";
import { AVAILABLE_ICONS, type IconName } from "@/shared/icons";

export function useFilteredIcons(searchQuery: string): IconName[] {
  return useMemo(() => {
    const icons = AVAILABLE_ICONS as unknown as IconName[];
    if (!searchQuery.trim()) return icons;
    return icons.filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);
}
