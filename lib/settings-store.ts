"use client";

import { useSyncExternalStore } from "react";
import { defaultSettings, storage } from "./storage";
import type { Settings } from "./types";

/**
 * Settings as a tiny external store on top of the `storage` seam, consumed
 * via `useSyncExternalStore`. Server/prerender sees the defaults; the client
 * snapshot reads localStorage once and stays referentially stable, so there
 * is no hydration mismatch and no load-into-state effect.
 */

let cached: Settings | null = null;
const listeners = new Set<() => void>();

function read(): Settings {
  if (cached === null) {
    cached = storage.get("settings", defaultSettings);
  }
  return cached;
}

function getSnapshot(): Settings {
  return read();
}

function getServerSnapshot(): Settings {
  return defaultSettings;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function patchSettings(patch: Partial<Settings>): void {
  cached = { ...read(), ...patch };
  storage.set("settings", cached);
  for (const listener of listeners) listener();
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
