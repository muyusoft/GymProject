import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import { EXERCISE_ALIASES } from "../data/exercise-aliases";
import { loadCandidates } from "../services/candidates.service";
import { importDays } from "../services/import.service";
import type { MatchDecision, ParseIssue } from "../types/notes-import.types";
import {
  buildImportDays,
  buildReviews,
  countImportLines,
  countPending,
  decisionKey,
  type DayReview,
  type Decisions,
} from "../utils/import-plan.utils";
import { buildCandidateIndex } from "../utils/match.utils";
import { parseNotes } from "../utils/parse-notes.utils";

interface ImportNotesState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  text: string;
  setText: (text: string) => void;
  reviews: DayReview[];
  issues: ParseIssue[];
  decisions: Decisions;
  decide: (dayIndex: number, lineNumber: number, decision: MatchDecision) => void;
  importableCount: number;
  pendingCount: number;
  isImporting: boolean;
  hasError: boolean;
  submit: () => Promise<void>;
}

export function useImportNotes(): ImportNotesState {
  const { t } = useTranslation();
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const { status, data, reload } = useFocusResource(loadCandidates);
  const [text, setTextState] = useState("");
  const [decisions, setDecisions] = useState<Decisions>({});
  const [now] = useState(() => new Date());
  const { run, isRunning, hasError } = useActionRunner();

  const index = useMemo(() => buildCandidateIndex(data ?? []), [data]);
  const notes = useMemo(() => parseNotes(text, now), [text, now]);
  const reviews = useMemo(() => buildReviews({ notes, index, aliases: EXERCISE_ALIASES }), [notes, index]);
  const days = useMemo(() => buildImportDays(reviews, decisions), [reviews, decisions]);

  const setText = useCallback((next: string) => {
    setTextState(next);
    setDecisions({});
  }, []);

  const decide = useCallback((dayIndex: number, lineNumber: number, decision: MatchDecision) => {
    setDecisions((current) => ({ ...current, [decisionKey(dayIndex, lineNumber)]: decision }));
  }, []);

  const submit = useCallback(async () => {
    const isImported = await run(() =>
      importDays({
        days,
        defaultUnit: weightUnit === "kg" ? "kg" : "lb",
        planName: t("plan.defaultName"),
        dayName: (weekday) => t("import.dayName", { weekday: t(`weekday.long.${weekday}`) }),
        now: new Date(),
      }),
    );
    if (isImported) router.replace("/routines");
  }, [days, run, t, weightUnit]);

  return {
    status,
    reload,
    text,
    setText,
    reviews,
    issues: notes.issues,
    decisions,
    decide,
    importableCount: countImportLines(days),
    pendingCount: countPending(reviews, decisions),
    isImporting: isRunning,
    hasError,
    submit,
  };
}
