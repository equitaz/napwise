/**
 * All user-facing copy lives here from day one (brief, Part 0/8). Swedish is
 * v1.5: translate this file and add a locale switch — no component changes.
 */
export const en = {
  app: {
    name: "Napwise",
    positioning:
      "The nap app that tells you when not to nap, learns what actually works for you, and never pretends to read your brain.",
    privacy: "No login. Your data stays on your phone.",
  },
  home: {
    phaseTag: "Phase 1 build",
    phaseNote:
      "Right now Napwise is one thing: an alarm that has to prove itself on a real iPhone before anything else gets built.",
    openLab: "Open the alarm lab",
  },
  testTimer: {
    title: "Alarm lab",
    subtitle:
      "Phase 1 gate: if this alarm fires reliably with the screen dimmed, Napwise gets built. Test it on a real iPhone.",
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
    wakeBody: "The tone keeps rising gently until you stop it.",
    awake: "I'm awake",
    announceStarted: (length: string) => `Timer started: ${length}.`,
    announceStopped: "Timer stopped.",
    announceWake: "Time to wake up.",
    audioError:
      "Audio couldn't start in this browser, so the alarm can't run. Tap Start again, or try another browser.",
  },
} as const;
