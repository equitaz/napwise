"use client";

import { useSyncExternalStore } from "react";
import { storage, type StorageKey, type StorageShape } from "./storage";

/**
 * A localStorage-backed external store consumed via `useSyncExternalStore`.
 * The server/prerender snapshot is the fallback, the client snapshot reads
 * storage once and stays referentially stable — no hydration mismatches and
 * no load-into-state effects. All app state (settings, sessions, day cache,
 * learn state, onboarding flag) goes through instances of this.
 */
export function createLocalStore<K extends StorageKey>(
  key: K,
  fallback: StorageShape[K],
) {
  let cached: StorageShape[K] | null = null;
  const listeners = new Set<() => void>();

  const read = (): StorageShape[K] => {
    if (cached === null) {
      cached = storage.get(key, fallback);
    }
    return cached;
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const set = (next: StorageShape[K]): void => {
    cached = next;
    storage.set(key, next);
    for (const listener of listeners) listener();
  };

  return {
    get: read,
    set,
    update(updater: (current: StorageShape[K]) => StorageShape[K]): void {
      set(updater(read()));
    },
    useValue(): StorageShape[K] {
      return useSyncExternalStore(subscribe, read, () => fallback);
    },
  };
}

const emptySubscribe = () => () => {};

/** False during prerender/hydration, true on the client — for gating UI that
 * depends entirely on localStorage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
