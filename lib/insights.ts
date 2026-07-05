import type { NapSession } from "./types";

/**
 * All "tracking" is pure functions over stored sessions (brief, Part 8.7).
 * Computed on the fly from localStorage — no background jobs, no server.
 */

export type BestLength = {
  minutes: number;
  avgDelta: number; // average (kssBefore − kssAfter); positive = more alert
  runs: number;
};

export function bestLengthByAvgDelta(
  sessions: readonly NapSession[],
  minRuns = 3,
): BestLength | null {
  const byLength = new Map<number, { sum: number; runs: number }>();
  for (const session of sessions) {
    if (!session.completedCheckin || session.kssAfter === null) continue;
    const entry = byLength.get(session.chosenMinutes) ?? { sum: 0, runs: 0 };
    entry.sum += session.kssBefore - session.kssAfter;
    entry.runs += 1;
    byLength.set(session.chosenMinutes, entry);
  }

  let best: BestLength | null = null;
  for (const [minutes, { sum, runs }] of byLength) {
    if (runs < minRuns) continue;
    const avgDelta = sum / runs;
    if (best === null || avgDelta > best.avgDelta) {
      best = { minutes, avgDelta, runs };
    }
  }
  return best;
}

export function completedSessionCount(
  sessions: readonly NapSession[],
): number {
  return sessions.filter((s) => s.completedCheckin && s.kssAfter !== null)
    .length;
}

/**
 * The optional personal nap window (brief, Part 5.9): pure arithmetic over
 * the reported wake time plus the established early-afternoon circadian dip
 * — roughly 6–8 hours after waking. No sensor, no claim of precision.
 */
export function napWindowFromWake(
  wakeTime: string,
): { start: string; end: string } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(wakeTime);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const format = (totalMinutes: number): string => {
    const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(wrapped / 60);
    const m = wrapped % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const wake = hours * 60 + minutes;
  return { start: format(wake + 6 * 60), end: format(wake + 8 * 60) };
}
