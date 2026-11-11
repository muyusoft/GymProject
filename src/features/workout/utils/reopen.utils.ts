interface ReopenTimes {
  startedAt: number;
  endedAt: number;
  now: number;
}

/**
 * Inicio de una sesión al reabrirla: se corre hacia adelante lo que estuvo cerrada, para que ese rato
 * no cuente en el reloj ni en la duración final. Si el reloj del teléfono va hacia atrás, no se mueve.
 */
export function reopenedStart({ startedAt, endedAt, now }: ReopenTimes): number {
  return startedAt + Math.max(0, now - endedAt);
}
