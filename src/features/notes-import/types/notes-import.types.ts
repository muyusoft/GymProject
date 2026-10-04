import type { LoadType, MuscleCategory, WeightUnit } from "@/shared/types/training.types";

/** Una línea de ejercicio ya entendida: "- Press: 30lb en cada brazo 4 series de 12, descansos 1m30s". */
export interface ParsedLine {
  lineNumber: number;
  raw: string;
  name: string;
  /** Texto entre paréntesis, p. ej. "hacia adentro". */
  note: string | null;
  weight: number | null;
  unit: WeightUnit | null;
  loadType: LoadType;
  sets: number;
  reps: number | null;
  seconds: number | null;
  restSec: number | null;
}

export interface DayHeader {
  /** 0 = lunes … 6 = domingo. */
  weekday: number;
  day: number;
  /** 0 = enero … 11 = diciembre. */
  month: number;
}

export type IssueReason = "unrecognized_line" | "line_without_day";

/** Una línea que no se pudo usar; se muestra al usuario para que nada se pierda sin aviso. */
export interface ParseIssue {
  lineNumber: number;
  raw: string;
  reason: IssueReason;
}

export interface ParsedDay {
  header: DayHeader | null;
  headerText: string;
  /** Fecha resuelta del encabezado (el año se deduce), o null sin encabezado. */
  date: Date | null;
  lines: ParsedLine[];
}

export interface ParsedNotes {
  days: ParsedDay[];
  issues: ParseIssue[];
}

export interface ExerciseCandidate {
  id: string;
  nameEs: string;
  nameEn: string;
  aliases: string[];
  category: MuscleCategory | null;
}

/** Nombres que el usuario escribe distinto al catálogo. `confirm` pide confirmación; `dayCategory` solo aplica en ese tipo de día. */
export interface AliasEntry {
  alias: string;
  exercise: string;
  confirm?: boolean;
  dayCategory?: MuscleCategory;
}

export type MatchStatus = "matched" | "confirm" | "unknown";

export interface LineMatch {
  status: MatchStatus;
  candidate: ExerciseCandidate | null;
}

/** Qué hizo el usuario con una línea dudosa. */
export type MatchDecision = "link" | "keep";

export interface ImportLine {
  parsed: ParsedLine;
  /** Ejercicio del catálogo al que se vincula; null crea un ejercicio nuevo con el nombre escrito. */
  exerciseId: string | null;
}

export interface ImportDay {
  weekday: number;
  date: Date;
  lines: ImportLine[];
}
