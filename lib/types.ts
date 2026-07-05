/**
 * Napwise data model (brief, Part 7). Everything lives in localStorage behind
 * the typed `storage` module. Fields the v1 UI doesn't use yet (e.g.
 * `usedCaffeine`) are still logged so v1.5/v2 have data to work with.
 */

export type SleepLastNight = "<5" | "5-6" | "6-7" | "7-8" | "8+" | "unknown";

export type AvailableTime = "10-15" | "20-25" | "30-40" | "60" | "90+";

export type ActivityAfter =
  | "focus"
  | "meeting"
  | "exercise"
  | "driving"
  | "kids"
  | "rest";

export type NapSession = {
  id: string;
  createdAt: string; // ISO
  timeOfDay: string; // "14:05"
  // before
  kssBefore: number; // 1–9
  sleepLastNight: SleepLastNight;
  availableTime: AvailableTime;
  activityAfter: ActivityAfter;
  // recommendation
  recommendedMinutes: number;
  chosenMinutes: number; // differs from recommendedMinutes if the user overrode
  usedCaffeine: boolean; // logged in v1 even though the toggle ships in v1.5
  // after
  kssAfter: number | null;
  fellAsleep: "yes" | "dozed" | "rest_only" | null;
  sleepOnsetBucket: string | null; // "5-10" … null if didn't sleep
  grogginess: "none" | "little" | "moderate" | "much" | null;
  completedCheckin: boolean;
};

export type SoundKind = "silent" | "white" | "brown";

export type NoiseDuration = "whole" | "first10" | "off";

export type Settings = {
  lastAvailableTime: AvailableTime;
  lastActivityAfter: ActivityAfter;
  sound: SoundKind;
  noiseDuration: NoiseDuration;
  volume: number; // 0–1
  locale: "en"; // "sv" added in v1.5
};

export type DayCache = {
  date: string; // "YYYY-MM-DD"
  sleepLastNight: SleepLastNight;
  wakeTime?: string; // "07:30", for the optional nap-window feature
};

export type LearnState = {
  lastSeenCardId?: string; // so "today's card" can rotate deterministically
  readCardIds: string[]; // for a subtle "read" checkmark, optional
};
