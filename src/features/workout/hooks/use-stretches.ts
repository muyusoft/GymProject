import { useCallback, useMemo } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import { loadWorkedLoad } from "../services/warmup.service";
import type { Movement } from "../types/warmup.types";
import { pickStretches } from "../utils/warmup-selection.utils";

interface Stretches {
  status: ResourceStatus;
  reload: () => Promise<void>;
  movements: readonly Movement[];
}

/** Los estiramientos para lo que se entrenó de verdad en la sesión, según el tiempo elegido. */
export function useStretches(sessionId: string): Stretches {
  const minutes = useSettingsStore((state) => state.sessionMinutes);
  const loader = useCallback(() => loadWorkedLoad(sessionId), [sessionId]);
  const { status, data, reload } = useFocusResource(loader);
  const movements = useMemo(() => (data ? pickStretches(data, minutes) : []), [data, minutes]);
  return { status, reload, movements };
}
