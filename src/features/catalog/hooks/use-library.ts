import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import type { Equipment, MuscleCategory } from "@/shared/types/training.types";
import { addExerciseToDay, loadLibrary } from "../services/library.service";
import type { LibraryFilters, LibraryRow } from "../types/catalog.types";
import { buildLibraryRows, filterLibrary } from "../utils/library-filter.utils";

interface LibraryState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  rows: LibraryRow[];
  filters: LibraryFilters;
  setQuery: (query: string) => void;
  setCategory: (category: MuscleCategory | null) => void;
  setEquipment: (equipment: Equipment | null) => void;
  targetWeekday: number | null;
  canAdd: boolean;
  addToDay: (exerciseId: string) => Promise<void>;
  hasError: boolean;
}

export function useLibrary(dayId: string | undefined): LibraryState {
  const { i18n } = useTranslation();
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const loader = useCallback(() => loadLibrary(dayId), [dayId]);
  const { status, data, reload } = useFocusResource(loader);
  const [filters, setFilters] = useState<LibraryFilters>({ query: "", category: null, equipment: null });
  const { run, hasError } = useActionRunner();

  const rows = useMemo(
    () => buildLibraryRows(filterLibrary(data?.exercises ?? [], filters), i18n.language),
    [data, filters, i18n.language],
  );

  const addToDay = useCallback(
    async (exerciseId: string) => {
      if (!dayId) return;
      const unit = weightUnit === "kg" ? "kg" : "lb";
      if (await run(() => addExerciseToDay({ dayId, exerciseId, unit }))) await reload();
    },
    [dayId, weightUnit, run, reload],
  );

  return {
    status,
    reload,
    rows,
    filters,
    setQuery: (query) => setFilters((current) => ({ ...current, query })),
    setCategory: (category) => setFilters((current) => ({ ...current, category })),
    setEquipment: (equipment) => setFilters((current) => ({ ...current, equipment })),
    targetWeekday: data?.targetWeekday ?? null,
    canAdd: dayId !== undefined,
    addToDay,
    hasError,
  };
}
