import { bestLengthByAvgDelta } from "./insights";
import type {
  ActivityAfter,
  AvailableTime,
  NapSession,
  SleepLastNight,
} from "./types";

/**
 * The core of the product (brief, Part 6): ONE pure, rule-based function.
 * No AI, no scattered if/else in UI code. Reasons are structured codes so
 * the i18n dictionary owns the wording, and every reason that has a matching
 * Learn card links to it by id — the transparency IS the product.
 *
 * Priority order (resolves conflicts): safety → available time →
 * sleep-inertia risk → sleep need → personal history.
 */

export type SessionKey =
  | "skip"
  | "micro"
  | "power"
  | "performance"
  | "recovery"
  | "full";

export type Session = { key: SessionKey; minutes: number };

// Locked list. NEVER 45 or 60 (inertia risk without a clear upside).
export const SESSIONS: Record<SessionKey, Session> = {
  skip: { key: "skip", minutes: 0 },
  micro: { key: "micro", minutes: 10 },
  power: { key: "power", minutes: 20 },
  performance: { key: "performance", minutes: 25 },
  recovery: { key: "recovery", minutes: 30 },
  full: { key: "full", minutes: 90 },
};

export const NAP_OPTIONS: readonly Session[] = [
  SESSIONS.micro,
  SESSIONS.power,
  SESSIONS.performance,
  SESSIONS.recovery,
  SESSIONS.full,
];

export type ReasonCode =
  | "safety_driving"
  | "micro_boost"
  | "low_grogginess"
  | "high_sleep_pressure"
  | "recovery_need"
  | "full_cycle_fit"
  | "default_powernap"
  | "afternoon_dip"
  | "late_day_cap"
  | "night_sleep_risk"
  | "not_sleepy"
  | "personal_best";

export type RejectCode =
  | "safety_cap"
  | "exceeds_window"
  | "sleep_inertia_risk"
  | "night_sleep_risk"
  | "less_effective_here"
  | "not_enough_benefit"
  | "skip_not_needed";

/** Learn card each reason links to (brief 5.4). */
export const REASON_LEARN_CARD: Record<ReasonCode, string> = {
  safety_driving: "sleep-inertia",
  micro_boost: "ten-minute-mvp",
  low_grogginess: "sleep-inertia",
  high_sleep_pressure: "sleep-pressure",
  recovery_need: "short-night-math",
  full_cycle_fit: "ninety-minute-cycle",
  default_powernap: "twenty-minute-sweet-spot",
  afternoon_dip: "afternoon-dip",
  late_day_cap: "dont-nap-late",
  night_sleep_risk: "dont-nap-late",
  not_sleepy: "myth-everyone",
  personal_best: "kss-scale",
};

export type Reason = {
  code: ReasonCode;
  learnCardId: string;
  minutes?: number; // for personal_best: the user's best length
};

export type RejectedOption = { session: Session; code: RejectCode };

export type RecommendInput = {
  kss: number; // 1–9
  sleepLastNight: SleepLastNight;
  availableTime: AvailableTime;
  activityAfter: ActivityAfter;
  hour: number; // local time of day, 0–23 (fractional ok); read via new Date(), never asked
  history: readonly NapSession[];
};

export type Recommendation = {
  session: Session;
  reasons: Reason[];
  rejected: RejectedOption[];
};

const WINDOW_MAX: Record<AvailableTime, number> = {
  "10-15": 15,
  "20-25": 25,
  "30-40": 40,
  "60": 60,
  "90+": Number.POSITIVE_INFINITY,
};

const SHORT_NIGHTS: readonly SleepLastNight[] = ["<5", "5-6"];
const GOOD_NIGHTS: readonly SleepLastNight[] = ["7-8", "8+"];
// Activities where the user must perform right after waking → prioritize
// low grogginess (brief Q4 microcopy).
const PERFORM_CRITICAL: readonly ActivityAfter[] = [
  "focus",
  "meeting",
  "driving",
];

const LATE_DAY_HOUR = 16; // after this: cap at short naps + night-sleep note
const EVENING_HOUR = 20; // after this: suggest Skip outright
const NIGHT_END_HOUR = 5; // 00:00–05:00 is night sleep territory, not nap territory
const PERSONAL_BEST_MIN_RUNS = 3;

function reason(code: ReasonCode, minutes?: number): Reason {
  return {
    code,
    learnCardId: REASON_LEARN_CARD[code],
    ...(minutes !== undefined ? { minutes } : {}),
  };
}

export function recommendSession(input: RecommendInput): Recommendation {
  const { kss, sleepLastNight, availableTime, activityAfter, hour, history } =
    input;
  const windowMax = WINDOW_MAX[availableTime];
  const shortNight = SHORT_NIGHTS.includes(sleepLastNight);
  const goodNight = GOOD_NIGHTS.includes(sleepLastNight);
  const performCritical = PERFORM_CRITICAL.includes(activityAfter);
  // Shift-worker mode is explicitly v2 (brief, Part 13) — until then, the
  // small hours count as night, and the honest answer is real sleep.
  const evening = hour >= EVENING_HOUR || hour < NIGHT_END_HOUR;
  const lateDay = hour >= LATE_DAY_HOUR && hour < EVENING_HOUR;
  const afternoonDip = hour >= 12 && hour < 15;

  // Hard disqualifications, in priority order. Whatever survives is eligible.
  const disqualified = new Map<SessionKey, RejectCode>();
  for (const option of NAP_OPTIONS) {
    if (activityAfter === "driving" && option.minutes > 20) {
      disqualified.set(option.key, "safety_cap");
    } else if (option.minutes > windowMax) {
      disqualified.set(option.key, "exceeds_window");
    } else if (evening) {
      disqualified.set(option.key, "night_sleep_risk");
    } else if (lateDay && option.minutes > 20) {
      disqualified.set(option.key, "night_sleep_risk");
    } else if (performCritical && option.minutes > 25) {
      disqualified.set(option.key, "sleep_inertia_risk");
    }
  }
  const eligible = NAP_OPTIONS.filter((o) => !disqualified.has(o.key));

  // Skip outcomes. Skip is a first-class recommendation, not a failure.
  if (evening) {
    return {
      session: SESSIONS.skip,
      reasons: [reason("night_sleep_risk")],
      rejected: NAP_OPTIONS.map((session) => ({
        session,
        code: "night_sleep_risk" as const,
      })),
    };
  }
  if (kss <= 4 && goodNight) {
    return {
      session: SESSIONS.skip,
      reasons: [reason("not_sleepy")],
      rejected: NAP_OPTIONS.map((session) => ({
        session,
        code: disqualified.get(session.key) ?? ("not_enough_benefit" as const),
      })),
    };
  }
  if (eligible.length === 0) {
    // Defensive: with the current rules only `evening` empties the list,
    // but a Skip fallback beats a crash if the rules evolve.
    return {
      session: SESSIONS.skip,
      reasons: [reason("night_sleep_risk")],
      rejected: NAP_OPTIONS.map((session) => ({
        session,
        code: disqualified.get(session.key) ?? ("night_sleep_risk" as const),
      })),
    };
  }

  const canPick = (key: SessionKey) => !disqualified.has(key);

  // Base pick: the reference matrix, applied within the constraints above.
  let pick: Session;
  if (kss >= 8 && shortNight && activityAfter === "rest" && canPick("full")) {
    pick = SESSIONS.full;
  } else if (kss >= 8 && shortNight && !performCritical && canPick("recovery")) {
    pick = SESSIONS.recovery;
  } else if (windowMax < 20) {
    pick = SESSIONS.micro;
  } else if (kss >= 8 && activityAfter === "focus" && canPick("performance")) {
    pick = SESSIONS.performance;
  } else if (canPick("power")) {
    pick = SESSIONS.power;
  } else {
    pick = SESSIONS.micro;
  }

  // Personal history (priority 5): after enough logged runs of a length,
  // nudge toward the user's best average KSS improvement — always within
  // the rules above.
  let personalBest: { minutes: number } | null = null;
  const best = bestLengthByAvgDelta(history, PERSONAL_BEST_MIN_RUNS);
  if (best && best.avgDelta > 0) {
    const bestOption = NAP_OPTIONS.find((o) => o.minutes === best.minutes);
    if (bestOption && canPick(bestOption.key)) {
      pick = bestOption;
      personalBest = { minutes: best.minutes };
    }
  }

  // Reasons for the final pick — every one visible, every one sourced.
  const reasons: Reason[] = [];
  if (activityAfter === "driving") reasons.push(reason("safety_driving"));
  if (personalBest) reasons.push(reason("personal_best", personalBest.minutes));
  switch (pick.key) {
    case "micro":
      reasons.push(reason("micro_boost"));
      break;
    case "power":
      reasons.push(reason("default_powernap"));
      break;
    case "performance":
      reasons.push(reason("high_sleep_pressure"), reason("low_grogginess"));
      break;
    case "recovery":
      reasons.push(reason("high_sleep_pressure"), reason("recovery_need"));
      break;
    case "full":
      reasons.push(reason("high_sleep_pressure"), reason("full_cycle_fit"));
      break;
    default:
      break;
  }
  if (performCritical && activityAfter !== "driving" && pick.minutes <= 25) {
    reasons.push(reason("low_grogginess"));
  }
  if (kss >= 7 && shortNight && pick.minutes <= 25) {
    reasons.push(reason("high_sleep_pressure"));
  }
  if (afternoonDip) reasons.push(reason("afternoon_dip"));
  if (lateDay) reasons.push(reason("late_day_cap"));

  // Dedupe by code, keep first occurrence (priority order above).
  const seen = new Set<ReasonCode>();
  const uniqueReasons = reasons.filter((r) =>
    seen.has(r.code) ? false : (seen.add(r.code), true),
  );

  // Reasons-against for everything not chosen — always populated.
  const rejected: RejectedOption[] = [];
  for (const option of NAP_OPTIONS) {
    if (option.key === pick.key) continue;
    const code =
      disqualified.get(option.key) ??
      (option.minutes > pick.minutes
        ? ("not_enough_benefit" as const)
        : ("less_effective_here" as const));
    rejected.push({ session: option, code });
  }
  rejected.push({ session: SESSIONS.skip, code: "skip_not_needed" });

  return { session: pick, reasons: uniqueReasons, rejected };
}
