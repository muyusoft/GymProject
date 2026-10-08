import type {
  ParseIssue,
  ParsedDay,
  ParsedNotes,
} from "../types/notes-import.types";
import { parseDayHeader, resolveHeaderDate } from "./day-header.utils";
import { parseExerciseLine } from "./line.utils";

/**
 * Texto pegado → días con sus ejercicios. Cada línea no vacía acaba en un ejercicio, en un encabezado
 * o en `issues`: nada se descarta sin avisar.
 */
export function parseNotes(text: string, today: Date): ParsedNotes {
  const days: ParsedDay[] = [];
  const issues: ParseIssue[] = [];

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const raw = rawLine.trim();
    if (raw === "") return;
    const lineNumber = index + 1;
    const header = parseDayHeader(raw);
    if (header) {
      days.push({
        header,
        headerText: raw,
        date: resolveHeaderDate(header, today),
        lines: [],
      });
      return;
    }
    const parsed = parseExerciseLine(raw, lineNumber);
    const current = days.at(-1);
    if (parsed && current) current.lines.push(parsed);
    else
      issues.push({
        lineNumber,
        raw,
        reason: parsed ? "line_without_day" : "unrecognized_line",
      });
  });

  return { days, issues };
}
