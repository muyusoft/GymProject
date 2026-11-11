import { useTranslation } from "react-i18next";
import { lineTitle, readyWhen, workedDayLabel, type RecoveryTranslate } from "../utils/recovery-line.utils";
import type { RecoveryLine } from "../utils/recovery-view.utils";

const PERCENT = 100;

interface RecoveryDetail {
  title: string;
  /** Frases cortas, cada una un dato: cuándo, cuánto necesita, cuánto lleva y cuándo estará listo. */
  facts: string[];
}

/** Los textos de la hoja de detalle de una línea de recuperación. */
export function useRecoveryDetail(line: RecoveryLine | null, now: number): RecoveryDetail {
  const { t, i18n } = useTranslation();
  if (!line) return { title: "", facts: [] };
  const translate: RecoveryTranslate = (key, values) => t(key, values);
  const options = { t: translate, locale: i18n.language, now };
  const worked = workedDayLabel(line, options);
  const when = readyWhen(line.readyAt, options);
  const facts = [
    worked === null ? null : t("recovery.detail.worked", { day: worked }),
    line.requiredHours === null ? null : t("recovery.detail.needs", { hours: line.requiredHours }),
    line.hardHours === null ? null : t("recovery.detail.hard"),
    t("recovery.detail.progress", { percent: Math.round(line.progress * PERCENT) }),
    when === null ? null : t("recovery.line.ready", { when }),
  ];
  return { title: lineTitle({ ...line, percent: null }, translate), facts: facts.filter((fact): fact is string => fact !== null) };
}
