import type {
  DayCache,
  LearnState,
  NapSession,
  Settings,
} from "./types";

/**
 * The single persistence seam (brief, Part 8.6). Every read/write in the app
 * goes through here so the backend can later be swapped for Capacitor
 * Preferences without touching feature code. Safari private mode can throw on
 * any localStorage access, hence the try/catch on every call.
 */

const PREFIX = "napwise:";

type StorageShape = {
  hasOnboarded: boolean;
  settings: Settings;
  sessions: NapSession[];
  dayCache: DayCache;
  learn: LearnState;
};

export type StorageKey = keyof StorageShape;

export const storage = {
  get<K extends StorageKey>(key: K, fallback: StorageShape[K]): StorageShape[K] {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as StorageShape[K]);
    } catch {
      return fallback;
    }
  },

  set<K extends StorageKey>(key: K, value: StorageShape[K]): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — the app keeps working, it just forgets.
    }
  },

  remove(key: StorageKey): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      // Ignore.
    }
  },
};

export const defaultSettings: Settings = {
  lastAvailableTime: "20-25",
  lastActivityAfter: "focus",
  sound: "white",
  noiseDuration: "whole",
  volume: 0.5,
  locale: "en",
};

