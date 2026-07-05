import type {
  ActivityAfter,
  AvailableTime,
  SleepLastNight,
} from "../types";
import type { RejectCode, ReasonCode, SessionKey } from "../recommend";
import type { LearnCategoryId } from "../learn-cards";

/**
 * All user-facing copy lives here from day one (brief, Part 0/8). Swedish is
 * v1.5: translate this file (and the Learn cards data) and add a locale
 * switch — no component changes.
 *
 * Copy rules (brief, Part 1): never claim sleep-stage knowledge, hedged
 * wording for recommendations, "learns what works" — never "sleep tracking".
 */
export const en = {
  app: {
    name: "Napwise",
    positioning:
      "The nap app that tells you when not to nap, learns what actually works for you, and never pretends to read your brain.",
    privacy: "No login. Your data stays on your phone.",
  },
  nav: {
    nap: "Nap",
    learn: "Learn",
    history: "History",
  },
  intro: {
    body: "Napwise helps you find the shortest nap that gives you the most energy. Answer 4 quick questions, get a recommendation, and the app learns what works for you.",
    cta: "Get started",
  },
  // Validated Karolinska Sleepiness Scale labels (Åkerstedt & Gillberg, 1990).
  kss: {
    labels: [
      "Extremely alert",
      "Very alert",
      "Alert",
      "Rather alert",
      "Neither alert nor sleepy",
      "Some signs of sleepiness",
      "Sleepy, but no effort to keep awake",
      "Sleepy, some effort to keep awake",
      "Very sleepy, great effort to keep awake",
    ] as readonly string[],
  },
  questions: {
    kssTitle: "How sleepy are you right now?",
    kssMicrocopy:
      "We compare before and after to learn which nap actually helps you.",
    sleepTitle: "How much did you sleep last night?",
    sleepMicrocopy: "A short night can change which nap length suits you.",
    sleepOptions: {
      "<5": "Under 5 h",
      "5-6": "5–6 h",
      "6-7": "6–7 h",
      "7-8": "7–8 h",
      "8+": "8+ h",
      unknown: "Not sure",
    } as Record<SleepLastNight, string>,
    timeTitle: "How much time do you have?",
    timeMicrocopy: "We only recommend a session that fits your real window.",
    timeOptions: {
      "10-15": "10–15 min",
      "20-25": "20–25 min",
      "30-40": "30–40 min",
      "60": "About an hour",
      "90+": "90+ min",
    } as Record<AvailableTime, string>,
    activityTitle: "What's right after your nap?",
    activityMicrocopy:
      "If you must perform right after, we prioritize low grogginess.",
    activityOptions: {
      focus: "Focus, work or study",
      meeting: "A meeting or social",
      exercise: "Exercise",
      driving: "Driving or safety-critical",
      kids: "Kids / home",
      rest: "Resting, no rush",
    } as Record<ActivityAfter, string>,
    stepOf: (step: number, total: number) => `Question ${step} of ${total}`,
  },
  checkin: {
    title: "Ready for a nap?",
    timeChipLabel: "Time",
    activityChipLabel: "After",
    sleepChipLabel: "Last night",
    bestLine: (minutes: number) =>
      `So far, ${minutes} min has given you the biggest lift.`,
    wakeQuestion: "When did you wake up today?",
    wakeOptionalHint: "Optional — it places your likely afternoon dip.",
    wakeSkip: "Skip",
    dipLine: (start: string, end: string) =>
      `Your likely dip today: ${start}–${end}.`,
    cta: "Get my recommendation",
    ctaHint: "Rate your sleepiness first — that's the before-measurement.",
  },
  recommend: {
    basedOn:
      "Based on your sleepiness, last night, the time of day, and your available time, we suggest…",
    sessionNames: {
      skip: "Skip",
      micro: "Micro Reset",
      power: "Power Nap",
      performance: "Performance Nap",
      recovery: "Recovery Nap",
      full: "Full Cycle",
    } as Record<SessionKey, string>,
    minutes: (minutes: number) => `${minutes} min`,
    whyTitle: "Why this one",
    reasons: {
      safety_driving:
        "You're driving afterwards — never longer than 20 minutes. And don't drive if you're still sleepy.",
      micro_boost:
        "A 10-minute reset gives a fast alertness boost with no groggy dip.",
      low_grogginess:
        "You need to perform right after, so we keep the grogginess risk low.",
      high_sleep_pressure:
        "Your sleepiness is high, so a nap should genuinely help right now.",
      recovery_need:
        "A short night raises the case for a longer recovery nap.",
      full_cycle_fit:
        "You have time for a full sleep cycle — waking near light sleep again.",
      default_powernap:
        "About 20 minutes is the reliable default: a real boost without deep-sleep grogginess.",
      afternoon_dip:
        "It's early afternoon — you're working with your body clock's natural dip.",
      late_day_cap:
        "It's getting late, so we keep it short to protect tonight's sleep.",
      night_sleep_risk:
        "A nap this late would eat into the sleep pressure you need tonight.",
      not_sleepy:
        "You rated yourself alert and slept well — a nap now wouldn't give you much.",
      personal_best: "", // rendered via personalBest() below
    } as Record<ReasonCode, string>,
    personalBest: (minutes: number) =>
      `You tend to get the best results from ${minutes} min.`,
    seeOther: "See other options",
    rejects: {
      safety_cap: "Too long before driving.",
      exceeds_window: "Doesn't fit your window.",
      sleep_inertia_risk: "Higher grogginess risk before your next activity.",
      night_sleep_risk: "Too late in the day — it would cut into tonight's sleep.",
      less_effective_here: "Likely a smaller lift than you need right now.",
      not_enough_benefit: "More time asleep than you'd likely benefit from now.",
      skip_not_needed: "You reported real sleepiness — a nap should help.",
    } as Record<RejectCode, string>,
    choose: "Choose this instead",
    start: (minutes: number) => `Start ${minutes} min nap`,
    skipHeadline: "Our honest take: skip this one",
    napAnyway: (minutes: number) => `Nap anyway · ${minutes} min`,
    skipAccept: "Good call, skipping",
    back: "Back",
  },
  timer: {
    prepTitle: "Set up your nap",
    sound: "Sound",
    soundSilent: "Silent",
    soundWhite: "White noise",
    soundBrown: "Brown noise",
    noiseDuration: "Noise plays",
    noiseWhole: "Whole nap",
    noiseFirst10: "First 10 min",
    noiseOff: "Off",
    volume: "Volume",
    begin: "Begin nap",
    devShort: "Dev: 30 sec run",
    napping: "Eyes closed. The alarm is already scheduled.",
    keepScreenOn: "Put your phone beside you, screen up. Don't lock it.",
    fallbackAlarm: "Not sure it'll work? Set your phone's own alarm too.",
    brightnessTip: "Tip: turn your screen brightness down.",
    cancel: "Cancel nap",
    confirmCancel: "Tap again to cancel",
    announceStarted: (minutes: number) =>
      `Nap started: ${minutes} minutes.`,
    announceCancelled: "Nap cancelled.",
    audioError:
      "Audio couldn't start in this browser, so the alarm can't run. Tap again, or try another browser.",
  },
  wake: {
    title: "Time to wake up",
    body: "The alarm keeps rising until you stop it.",
    awake: "I'm awake",
  },
  postnap: {
    title: "Quick check-in",
    kssTitle: "How sleepy are you now?",
    fellAsleepTitle: "Did you fall asleep?",
    fellAsleepOptions: {
      yes: "Yes",
      dozed: "Dozed",
      rest_only: "No, but rested",
    },
    onsetTitle: "How long until you fell asleep?",
    onsetMicrocopy:
      "We use this to estimate your real sleep time and improve recommendations.",
    onsetOptions: {
      immediate: "Almost immediately",
      "<5": "Under 5 min",
      "5-10": "5–10 min",
      "10-20": "10–20 min",
      "20+": "20+ min",
    } as Record<string, string>,
    grogginessTitle: "How groggy do you feel?",
    grogginessOptions: {
      none: "None",
      little: "A little",
      moderate: "Somewhat",
      much: "A lot",
    },
    save: "See my result",
  },
  result: {
    title: "Your result",
    sleepiness: (before: number, after: number) =>
      `Sleepiness: ${before} → ${after}`,
    moreAlert: (delta: number) => `You're more alert (+${delta}).`,
    noChange: "About the same as before — that happens.",
    moreSleepy: (delta: number) =>
      `You're sleepier than before (−${delta}). It happens — the data still helps.`,
    restOnly:
      "You rested without sleeping. That still counts — but we won't pretend it was sleep.",
    done: "Done",
  },
  history: {
    title: "History",
    empty: "No naps logged yet. Your first completed session lands here.",
    bestLine: (minutes: number) =>
      `Best so far: ${minutes} min gives you the biggest average lift.`,
    notCompleted: "wake-up logged, check-in skipped",
    delta: (delta: number) =>
      delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : "±0",
  },
  learn: {
    title: "Learn",
    intro: "Short, sourced sleep science. No vibes, no brain-reading.",
    todays: "Today's card",
    source: "Source",
    read: "Read",
    back: "All cards",
    categories: {
      length: "Nap length",
      timing: "Timing & your body clock",
      pressure: "Sleep debt & pressure",
      caffeine: "Caffeine & naps",
      myths: "Myths & facts",
    } as Record<LearnCategoryId, string>,
  },
  testTimer: {
    tag: "Phase 1 lab",
    title: "Alarm lab",
    subtitle:
      "Phase 1 gate: if this alarm fires reliably with the screen dimmed, Napwise gets built. Test it on a real phone.",
    duration: "Length",
    sound: "Sound",
    soundSilent: "Silent",
    soundWhite: "White noise",
    soundBrown: "Brown noise",
    volume: "Volume",
    volumeSilentHint: "Volume applies to noise — the wake tone manages itself.",
    start: "Start",
    stop: "Stop",
    confirmStop: "Tap again to stop",
    napping: "Eyes closed. The alarm is already scheduled.",
    keepScreenOn: "Put your phone beside you, screen up. Don't lock it.",
    fallbackAlarm: "Not sure it'll work? Set your phone's own alarm too.",
    brightnessTip: "Tip: turn your screen brightness down.",
    wakeTitle: "Time to wake up",
    wakeBody: "The alarm keeps rising until you stop it.",
    awake: "I'm awake",
    announceStarted: (length: string) => `Timer started: ${length}.`,
    announceStopped: "Timer stopped.",
    announceWake: "Time to wake up.",
    audioError:
      "Audio couldn't start in this browser, so the alarm can't run. Tap Start again, or try another browser.",
  },
  common: {
    next: "Next",
    back: "Back",
    close: "Close",
  },
} as const;
