// Local-day key helpers for the Daily Quests module.
// Every quest is anchored to a *local* calendar day ("YYYY-MM-DD") and the
// module's day boundary is the user's resetHour (see lib/actions/daily-quest-actions.ts).

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local day key (YYYY-MM-DD) for a Date, using local timezone fields. */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Build a local-midnight Date from a day key. */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Add n days to a day key and return the new key. */
export function addDays(key: string, n: number): string {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/** YYYY-MM-01 day key of the month containing the given day key. */
export function startOfMonthKey(key: string): string {
  const d = parseDayKey(key);
  return dayKey(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Add n months to a day key (clamped to the 1st of the resulting month). */
export function addMonths(key: string, n: number): string {
  const d = parseDayKey(key);
  return dayKey(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

/** "YYYY-MM" prefix of a day key. */
export function monthKey(key: string): string {
  return key.slice(0, 7);
}

/** Local hour (0-23). */
export function localHour(d: Date): number {
  return d.getHours();
}

/** Whole calendar days between two day keys (bKey - aKey). */
export function daysBetween(aKey: string, bKey: string): number {
  return Math.round((parseDayKey(bKey).getTime() - parseDayKey(aKey).getTime()) / DAY_MS);
}

/** Format a minute count as "1h 15m" / "45m" / "3h". */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format a millisecond countdown as HH:MM:SS. */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** ISO timestamp string of now (for client/server clock alignment). */
export function nowIso(): string {
  return new Date().toISOString();
}