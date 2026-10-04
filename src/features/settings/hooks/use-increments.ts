import { useCallback, useEffect, useState } from "react";
import { logger } from "@/config/logger";
import type { EquipmentIncrementRow } from "@/shared/db/types";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadIncrements, saveIncrementStep } from "../services/settings.service";

interface IncrementsState {
  status: ResourceStatus;
  increments: EquipmentIncrementRow[];
  reload: () => Promise<void>;
  changeStep: (id: string, step: number) => void;
}

export function useIncrements(): IncrementsState {
  const { status, data, reload } = useFocusResource(loadIncrements);
  const [increments, setIncrements] = useState<EquipmentIncrementRow[]>([]);

  useEffect(() => {
    if (data) setIncrements(data);
  }, [data]);

  const changeStep = useCallback(
    (id: string, step: number) => {
      setIncrements((rows) => rows.map((row) => (row.id === id ? { ...row, step } : row)));
      saveIncrementStep(id, step).catch((error: unknown) => {
        logger.error("Failed to save increment", { error });
        void reload();
      });
    },
    [reload],
  );

  return { status, increments, reload, changeStep };
}
