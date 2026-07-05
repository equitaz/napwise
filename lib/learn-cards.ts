/**
 * The Learn library (brief, Part 9). Card contract: title + 2–4 sentence
 * body + a REQUIRED source. No source, no card — that rule is what separates
 * Napwise from vibes-based sleep blogs. Where evidence is mixed, the card
 * says so. Recommendation reasons deep-link into these by id.
 *
 * v1.5 note: Swedish lands by swapping this data file alongside the i18n
 * dictionary.
 */

export type LearnCategoryId =
  | "length"
  | "timing"
  | "pressure"
  | "caffeine"
  | "myths";

export const LEARN_CATEGORY_ORDER: readonly LearnCategoryId[] = [
  "length",
  "timing",
  "pressure",
  "caffeine",
  "myths",
];

export type LearnCard = {
  id: string;
  category: LearnCategoryId;
  title: string;
  body: string;
  source: string;
};

export const LEARN_CARDS: readonly LearnCard[] = [
  // Category A — Nap length
  {
    id: "twenty-minute-sweet-spot",
    category: "length",
    title: "The 20-minute sweet spot",
    body: "A roughly 20-minute nap keeps you mostly in light sleep, so you get an alertness and mood boost without the deep-sleep grogginess of longer naps. It's the reliable default for most people, most days.",
    source:
      'Sleep Foundation, "Do Power Naps Work?"; Harvard Health, 2024.',
  },
  {
    id: "ten-minute-mvp",
    category: "length",
    title: "The 10-minute nap might be the real MVP",
    body: "In a controlled afternoon-nap study, a 10-minute nap produced immediate improvements in alertness and performance that lasted up to about 155 minutes — with no groggy dip on waking. If you're short on time, 10 minutes is not a consolation prize.",
    source: "Brooks & Lack, 2006, SLEEP (Oxford Academic).",
  },
  {
    id: "thirty-plus-backfire",
    category: "length",
    title: "Why 30+ minutes can backfire (in the short term)",
    body: "In the same study, a 30-minute nap caused a period of impaired alertness right after waking — sleep inertia — before the benefits kicked in. Deep sleep typically starts around the 30-minute mark, and that's what you're bumping into.",
    source: "Brooks & Lack, 2006, SLEEP; Harvard Health, 2024.",
  },
  {
    id: "ninety-minute-cycle",
    category: "length",
    title: "The 90-minute full cycle",
    body: "A roughly 90-minute nap lets you complete a full sleep cycle and wake near light sleep again, so inertia is usually brief. It's the option for when you have real time and want memory and creativity benefits, not just a quick reset.",
    source: 'Sleep Foundation, "Do Power Naps Work?".',
  },
  {
    id: "sleep-inertia",
    category: "length",
    title: "Sleep inertia, explained",
    body: "Sleep inertia is the groggy, disoriented feeling after waking from deep sleep; it can last anywhere from a few minutes to an hour. Short naps are designed to end before you hit that deep stage.",
    source: "Ubie Health / Sleep Foundation; Harvard Health, 2024.",
  },

  // Category B — Timing & circadian rhythm
  {
    id: "afternoon-dip",
    category: "timing",
    title: "The afternoon dip is real",
    body: "Most people hit a natural energy low in the early afternoon, driven by the body clock — not just lunch. Roughly 1–3 pm is the sweet spot for a nap, because you're working with that dip instead of against it.",
    source: "Harvard Health, 2024; Sleep Foundation.",
  },
  {
    id: "dont-nap-late",
    category: "timing",
    title: "Don't nap too late",
    body: "Napping late in the afternoon or evening bleeds off the sleep pressure you need to fall asleep at night. If tonight's sleep matters, a late nap can cost you more than it gives.",
    source: "Harvard Health, 2024.",
  },
  {
    id: "process-c",
    category: "timing",
    title: "Process C: your internal clock",
    body: "The two-process model of sleep describes a circadian \"Process C\" that times when you feel alert or sleepy across 24 hours, independent of how long you've been awake. It's why 3 pm feels different from 3 am even on the same amount of sleep.",
    source:
      "Borbély, 1982; Borbély et al., 2016, Journal of Sleep Research.",
  },
  {
    id: "personal-nap-window",
    category: "timing",
    title: "Your personal nap window",
    body: "Your circadian dip tends to land in the middle stretch of your waking day, so your best nap time shifts with your wake time. If you got up late, your ideal window is later too.",
    source:
      "Two-process model (Borbély et al., 2016); Harvard Health, 2024.",
  },

  // Category C — Sleep debt & sleep pressure
  {
    id: "sleep-pressure",
    category: "pressure",
    title: "What sleep pressure actually is",
    body: "The longer you're awake, the more \"sleep pressure\" (Process S) builds — the drive that makes sleep feel urgent. Sleep discharges it; that's why even a short nap can clear the fog.",
    source: "Borbély et al., 2016; two-process model reviews.",
  },
  {
    id: "adenosine",
    category: "pressure",
    title: "Adenosine, the sleepy molecule",
    body: "As your brain uses energy through the day, adenosine accumulates and pushes you toward sleep; it's cleared during non-REM sleep. A nap lowers some of that buildup, which is part of why you wake clearer.",
    source: "Two-process model / adenosine reviews (MDPI Biology, 2016).",
  },
  {
    id: "nap-dents-debt",
    category: "pressure",
    title: "A nap dents sleep debt — it doesn't erase it",
    body: "Short naps genuinely relieve some sleep pressure and restore alertness, but they're not a full substitute for a proper night. Treat naps as a top-up, not a replacement.",
    source:
      "Horne et al., 2008, Journal of Sleep Research; Sleep Foundation.",
  },
  {
    id: "short-night-math",
    category: "pressure",
    title: "A short night changes the math",
    body: "After a bad night, sleep pressure is high, which makes a longer recovery nap more worthwhile — if your schedule and the time of day allow it. Napwise weighs your reported night sleep for exactly this reason.",
    source:
      "Brief-afternoon-nap sleep-restriction research (Brooks & Lack, 2006); Signos review.",
  },

  // Category D — Caffeine & naps
  {
    id: "coffee-nap",
    category: "caffeine",
    title: "The coffee nap",
    body: "Drink caffeine, then nap 15–20 minutes: in a driving-simulator study, caffeine plus a short nap cut mid-afternoon driving incidents to a fraction of placebo levels. Caffeine takes about 20 minutes to kick in, so you wake just as it activates.",
    source: "Reyner & Horne, 1997, Psychophysiology.",
  },
  {
    id: "caffeine-nap-stack",
    category: "caffeine",
    title: "Why caffeine + nap stacks",
    body: "Napping clears adenosine; caffeine then has fewer receptors to compete for, so it works better on a rested brain than a wired one. The two effects arrive at roughly the same time.",
    source:
      "National Geographic / Healthline synthesis of Reyner & Horne.",
  },
  {
    id: "caffeine-cutoff",
    category: "caffeine",
    title: "Mind your caffeine cutoff",
    body: "Caffeine has a long half-life, so a late coffee nap can wreck tonight's sleep. A common rule of thumb is no caffeine within about 6 hours of bedtime.",
    source: 'Healthline, "Coffee Nap."',
  },
  {
    id: "coffee-nap-caveat",
    category: "caffeine",
    title: "The honest caveat on coffee naps",
    body: "The evidence is promising but mixed: several studies show the combo beats caffeine or a nap alone, others find no extra benefit — and results depend on the person (habitual nappers respond differently). Worth trying, not a guarantee.",
    source: "Romdhani et al., 2021, Frontiers in Psychology.",
  },

  // Category E — Myths & facts
  {
    id: "myth-lazy",
    category: "myths",
    title: 'Myth: "Napping means you\'re lazy"',
    body: "NASA studied planned cockpit naps precisely because they improve performance: pilots given a nap opportunity were measurably more alert and made fewer errors on descent and landing. Strategic napping is a performance tool, not a weakness.",
    source:
      "Rosekind et al., 1995, NASA (NTRS report); Harvard Health.",
  },
  {
    id: "myth-catch-up",
    category: "myths",
    title: 'Myth: "You can catch up on all lost sleep with naps"',
    body: "Naps help, but they don't fully repay a sleep debt or replace consistent night sleep. If you're chronically short, the fix is your nights, not more naps.",
    source: "Horne et al., 2008, Journal of Sleep Research.",
  },
  {
    id: "myth-everyone",
    category: "myths",
    title: 'Myth: "Everyone should nap every day"',
    body: "Napping isn't for everyone. If you have insomnia or trouble sleeping at night, daytime naps can make it worse, and non-habitual nappers often feel heavier grogginess on waking. Napwise is fine with telling you to skip.",
    source:
      "Frontiers in Psychology, 2021 (non-habitual nappers); Sleep Foundation.",
  },
  {
    id: "myth-longer-better",
    category: "myths",
    title: 'Myth: "Longer naps are always better"',
    body: "Beyond about 30 minutes you trade a quick boost for grogginess, and habitually long daytime naps have been associated with higher blood pressure and blood-sugar markers in some studies. Longer isn't automatically more restorative.",
    source:
      "Harvard Health, 2024 (Obesity study reference); Signos review.",
  },
  {
    id: "kss-scale",
    category: "myths",
    title: "How Napwise measures your naps: the KSS",
    body: "Your before/after sleepiness rating uses the Karolinska Sleepiness Scale, a validated 1–9 research scale developed in Sweden and checked against brain-activity (EEG) measures. It's the same tool used in real fatigue studies — that's why the before/after delta means something.",
    source:
      "Åkerstedt & Gillberg, 1990, International Journal of Neuroscience; Kaida et al., 2006 (EEG validation).",
  },
  {
    id: "naps-memory",
    category: "myths",
    title: "Naps and memory",
    body: "Even brief naps can support memory and learning by giving the brain a short consolidation window. It's one reason a nap before an exam or a demanding task can pay off beyond just feeling awake.",
    source:
      "Signos review; Lonestar Neurology summary of nap/memory research.",
  },
  {
    id: "naps-mood",
    category: "myths",
    title: "Naps and mood",
    body: "A short nap can take the edge off irritability and improve emotional resilience, especially after a poor night. Sometimes the biggest win isn't sharper focus — it's not snapping at people at 3 pm.",
    source: "Signos review; Harvard Health, 2024.",
  },
  {
    id: "naps-heart",
    category: "myths",
    title: "Naps and your heart (with a caveat)",
    body: "Occasional short naps have been associated with better cardiovascular markers, while long, frequent naps have been linked to worse ones. These are associations, not proof of cause — so take the short-nap habit, not the all-afternoon one.",
    source: "Signos review; Harvard Health, 2024.",
  },
];

export function getLearnCard(id: string): LearnCard | undefined {
  return LEARN_CARDS.find((card) => card.id === id);
}

/**
 * Today's card rotates deterministically by date — no backend, everyone sees
 * the same card on the same day, and it changes daily.
 */
export function todaysCard(date = new Date()): LearnCard {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / 86_400_000,
  );
  return LEARN_CARDS[dayOfYear % LEARN_CARDS.length];
}
