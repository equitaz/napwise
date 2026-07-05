"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Remaining whole seconds derived from the wall clock (brief, Part 8.5) — a
 * throttled tab can skip ticks but never drifts. Quantizing to seconds keeps
 * the snapshot stable between interval ticks, which `useSyncExternalStore`
 * requires. The audio alarm does NOT depend on this: it was scheduled on the
 * audio clock at start.
 */
export function useCountdownSeconds(endsAt: number | null): number | null {
  const subscribe = useCallback(
    (onTick: () => void) => {
      if (endsAt === null) return () => {};
      const id = window.setInterval(onTick, 250);
      return () => window.clearInterval(id);
    },
    [endsAt],
  );

  const getSnapshot = useCallback(() => {
    if (endsAt === null) return null;
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  }, [endsAt]);

  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function formatRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
