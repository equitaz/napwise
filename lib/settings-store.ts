"use client";

import { createLocalStore } from "./local-store";
import { defaultSettings } from "./storage";
import type { Settings } from "./types";

const settingsStore = createLocalStore("settings", defaultSettings);

export function patchSettings(patch: Partial<Settings>): void {
  settingsStore.update((current) => ({ ...current, ...patch }));
}

export function useSettings(): Settings {
  return settingsStore.useValue();
}
