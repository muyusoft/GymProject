import { useCallback, useState } from "react";

/** Movimientos marcados como hechos; solo en pantalla, no se guardan. */
export function useChecklist(): { doneIds: ReadonlySet<string>; toggle: (id: string) => void; check: (id: string) => void } {
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setDoneIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const check = useCallback((id: string) => {
    setDoneIds((current) => (current.has(id) ? current : new Set(current).add(id)));
  }, []);

  return { doneIds, toggle, check };
}
