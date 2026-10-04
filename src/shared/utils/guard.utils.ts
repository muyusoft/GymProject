export function isOneOf<T extends string>(
  values: readonly T[],
  value: string,
): value is T {
  return (values as readonly string[]).includes(value);
}

/** Valida un texto de datos externos contra una lista cerrada; falla en voz alta si no está. */
export function parseOneOf<T extends string>(
  values: readonly T[],
  value: string,
  label: string,
): T {
  if (isOneOf(values, value)) return value;
  throw new Error(`Invalid ${label}: "${value}"`);
}
