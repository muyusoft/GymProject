import { useCallback, useEffect, useMemo, useState } from "react";
import { logger } from "@/config/logger";
import type { ResourceStatus } from "@/shared/hooks/use-focus-resource";
import type { Equipment } from "@/shared/types/training.types";
import { loadSubstituteContext } from "../services/substitute.service";
import type { SubstituteCandidate } from "../types/workout.types";
import {
  equipmentOptions,
  rankSubstitutes,
  searchSubstitutes,
  visibleSuggestions,
  type SubstituteContext,
} from "../utils/substitutes.utils";

interface SubstitutesState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  /** Sugerencias filtradas por equipo, o resultados de la búsqueda si hay texto. */
  candidates: SubstituteCandidate[];
  equipments: Equipment[];
  equipment: Equipment | null;
  setEquipment: (equipment: Equipment | null) => void;
  query: string;
  setQuery: (query: string) => void;
}

/** Sustitutos del ejercicio del plan. `excludedIds` debe ser estable (los ejercicios del entreno de hoy). */
export function useSubstitutes(originalExerciseId: string, excludedIds: readonly string[]): SubstitutesState {
  const [status, setStatus] = useState<ResourceStatus>("loading");
  const [context, setContext] = useState<SubstituteContext | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      setContext(await loadSubstituteContext(originalExerciseId, excludedIds));
      setStatus("ready");
    } catch (error) {
      logger.error("Failed to load substitutes", { error });
      setStatus("error");
    }
  }, [originalExerciseId, excludedIds]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const ranked = useMemo(() => (context ? rankSubstitutes(context) : []), [context]);
  const candidates = useMemo(() => {
    if (!context || query.trim() === "") return visibleSuggestions(ranked, equipment);
    return searchSubstitutes(context, query);
  }, [context, ranked, equipment, query]);

  return { status, reload, candidates, equipments: equipmentOptions(ranked), equipment, setEquipment, query, setQuery };
}
