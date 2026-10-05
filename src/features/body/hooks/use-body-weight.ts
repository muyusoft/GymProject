import { useMemo } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import { listBodyWeights } from "../services/body-weight.service";
import type { BodyView } from "../types/body.types";
import { buildBodyView } from "../utils/body-view.utils";

interface BodyWeightState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  view: BodyView | null;
}

export function useBodyWeight(): BodyWeightState {
  const { status, data, reload } = useFocusResource(listBodyWeights);
  const preference = useSettingsStore((state) => state.weightUnit);
  const frequency = useSettingsStore((state) => state.weighInFrequency);
  const heightCm = useSettingsStore((state) => state.heightCm);

  const view = useMemo(
    () => (data ? buildBodyView({ entries: data, today: new Date(), preference, frequency, heightCm }) : null),
    [data, preference, frequency, heightCm],
  );

  return { status, reload, view };
}
