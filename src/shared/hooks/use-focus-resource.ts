import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { logger } from "@/config/logger";

export type ResourceStatus = "loading" | "error" | "ready";

export interface FocusResource<T> {
  status: ResourceStatus;
  data: T | null;
  reload: () => Promise<void>;
}

/** Carga datos al enfocar la pantalla (así reflejan cambios hechos en otra). `loader` debe ser estable. */
export function useFocusResource<T>(loader: () => Promise<T>): FocusResource<T> {
  const [status, setStatus] = useState<ResourceStatus>("loading");
  const [data, setData] = useState<T | null>(null);

  const reload = useCallback(async () => {
    try {
      setData(await loader());
      setStatus("ready");
    } catch (error) {
      logger.error("Failed to load screen data", { error });
      setStatus("error");
    }
  }, [loader]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { status, data, reload };
}
