import { useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { toIsoDate } from "@/shared/utils/week.utils";
import { deleteBodyWeight, saveBodyWeight } from "../services/body-weight.service";
import type { BodyView } from "../types/body.types";
import { initialDraft } from "../utils/body-view.utils";

interface WeightEntryOptions {
  view: Pick<BodyView, "unit" | "latest" | "todayEntry">;
  onChanged: () => Promise<void>;
}

interface WeightEntryState {
  value: number;
  setValue: (value: number) => void;
  save: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  isSaving: boolean;
  hasError: boolean;
}

/** El peso que se está por registrar hoy y las acciones de guardar y borrar. */
export function useWeightEntry({ view, onChanged }: WeightEntryOptions): WeightEntryState {
  const [draft, setDraft] = useState<number | null>(null);
  const { run, isRunning, hasError } = useActionRunner();
  const value = draft ?? initialDraft(view.todayEntry ?? view.latest, view.unit);

  const save = async () => {
    const isSaved = await run(() => saveBodyWeight({ date: toIsoDate(new Date()), weight: value, unit: view.unit }));
    if (!isSaved) return;
    setDraft(null);
    await onChanged();
  };

  const remove = async (id: string) => {
    if (await run(() => deleteBodyWeight(id))) await onChanged();
  };

  return { value, setValue: setDraft, save, remove, isSaving: isRunning, hasError };
}
