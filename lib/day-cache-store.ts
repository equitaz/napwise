"use client";

import { createLocalStore } from "./local-store";
import type { DayCache, SleepLastNight } from "./types";

/** Local calendar date as YYYY-MM-DD. */
export function todayString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const fallback: DayCache = { date: "", sleepLastNight: "unknown" };

const dayCacheStore = createLocalStore("dayCache", fallback);

export function useDayCache(): DayCache {
  return dayCacheStore.useValue();
}

/** Sleep answer for today, or null if not asked yet today. "unknown" (the
 * user's explicit "Not sure") still counts as answered. */
export function todaysSleep(cache: DayCache): SleepLastNight | null {
  return cache.date === todayString() ? cache.sleepLastNight : null;
}

export function todaysWakeTime(cache: DayCache): string | null {
  return cache.date === todayString() ? (cache.wakeTime ?? null) : null;
}

/** Writes always stamp today's date; values from a previous day are dropped
 * rather than carried over. */
export function patchDayCache(patch: Partial<Omit<DayCache, "date">>): void {
  dayCacheStore.update((current) => {
    const today = todayString();
    const base: DayCache =
      current.date === today
        ? current
        : { date: today, sleepLastNight: "unknown" };
    return { ...base, ...patch, date: today };
  });
}
