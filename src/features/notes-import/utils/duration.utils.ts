const SECONDS_PER_MINUTE = 60;
const DURATION = /^(?:(\d+)m)?(?:(\d+)s)?$/;

/** "1m30s" → 90, "2m" → 120, "45s" → 45; null si no es una duración. */
export function parseDuration(text: string): number | null {
  const match = DURATION.exec(text.trim().toLowerCase());
  if (!match || (match[1] === undefined && match[2] === undefined)) return null;
  const minutes = Number(match[1] ?? 0);
  const seconds = Number(match[2] ?? 0);
  return minutes * SECONDS_PER_MINUTE + seconds;
}
