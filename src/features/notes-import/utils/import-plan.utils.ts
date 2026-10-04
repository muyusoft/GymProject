import type {
  AliasEntry,
  ImportDay,
  LineMatch,
  MatchDecision,
  ParsedDay,
  ParsedNotes,
} from "../types/notes-import.types";
import { matchDay, type CandidateIndex } from "./match.utils";

export interface DayReview {
  day: ParsedDay;
  matches: LineMatch[];
}

export type Decisions = Readonly<Record<string, MatchDecision>>;

export function decisionKey(dayIndex: number, lineNumber: number): string {
  return `${dayIndex}:${lineNumber}`;
}

interface ReviewOptions {
  notes: ParsedNotes;
  index: CandidateIndex;
  aliases: readonly AliasEntry[];
}

export function buildReviews({ notes, index, aliases }: ReviewOptions): DayReview[] {
  return notes.days.map((day) => ({ day, matches: matchDay({ lines: day.lines, index, aliases }) }));
}

/** Un día sin encabezado válido o sin fecha no se puede guardar: no se sabe en qué día va. */
function isImportable(review: DayReview): boolean {
  return review.day.header !== null && review.day.date !== null;
}

/** Las líneas dudosas bloquean la importación hasta que el usuario decide. */
export function countPending(reviews: readonly DayReview[], decisions: Decisions): number {
  return reviews.reduce(
    (total, review, dayIndex) =>
      total +
      review.matches.filter(
        (match, lineIndex) =>
          match.status === "confirm" &&
          decisions[decisionKey(dayIndex, review.day.lines[lineIndex]?.lineNumber ?? -1)] === undefined,
      ).length,
    0,
  );
}

function resolveExerciseId(match: LineMatch | undefined, decision: MatchDecision | undefined): string | null {
  if (!match?.candidate) return null;
  if (match.status === "matched") return match.candidate.id;
  return match.status === "confirm" && decision === "link" ? match.candidate.id : null;
}

export function buildImportDays(reviews: readonly DayReview[], decisions: Decisions): ImportDay[] {
  return reviews.flatMap((review, dayIndex): ImportDay[] => {
    const { header, date } = review.day;
    if (!isImportable(review) || !header || !date) return [];
    return [
      {
        weekday: header.weekday,
        date,
        lines: review.day.lines.map((parsed, lineIndex) => ({
          parsed,
          exerciseId: resolveExerciseId(
            review.matches[lineIndex],
            decisions[decisionKey(dayIndex, parsed.lineNumber)],
          ),
        })),
      },
    ];
  });
}

export function countImportLines(days: readonly ImportDay[]): number {
  return days.reduce((total, day) => total + day.lines.length, 0);
}
